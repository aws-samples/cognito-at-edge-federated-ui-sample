#!/bin/bash

app_name=$1
profile_name=$2
default_region="us-east-1"

fail_if_empty "$app_name" "Application name not specified"
echo_info "Using application name: $app_name"

export UPLOAD_ENV="remote"
cd web && . configure_auth.sh "$app_name" "$profile_name"

profile=""
if [ ! -z $profile_name ]; then
  echo_info "Using profile $profile_name"
  profile="--profile $profile_name"
fi

ui_stack_name="aws-sample-$app_name"

ui_stack_outputs=$(aws cloudformation describe-stacks --stack-name $ui_stack_name --query 'Stacks[0].Outputs' --output json --region $default_region $profile)

distribution_id=$(jq -r '.[] | select(.OutputKey=="cdndistributionidoutput") | .OutputValue' <<< $ui_stack_outputs)
s3_bucket_name=$(jq -r '.[] | select(.OutputKey=="icfrontends3output") | .OutputValue' <<< $ui_stack_outputs)

CWD=${pwd}

yarn install
yarn build

cd ./build

echo_info "Clearing old static resources..."
aws s3 rm s3://$s3_bucket_name/static/ $profile --recursive

echo_info "Uploading to $s3_bucket_name..."
aws s3 cp ./ s3://$s3_bucket_name/ $profile --recursive

echo_info "Invalidating CloudFront distribution $distribution_id..."
aws cloudfront create-invalidation --distribution-id $distribution_id $profile --paths "/*"