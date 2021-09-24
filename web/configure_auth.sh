#!/bin/bash
set -e

echo_info() {
  GREEN='\033[0;32m'
  NC='\033[0m'
  echo -e "${GREEN}$1${NC}"
}

echo_fail() {
  GREEN='\033[0;31m'
  NC='\033[0m'
  echo -e "${GREEN}$1${NC}"
}

fail_if_empty () {
  [ -z $1 ] && echo_fail "$2" && exit 1
  return 0 
}

app_name=$1
profile_name=$2
default_region="us-east-1"
default_api_region="us-east-1"

fail_if_empty "$app_name" "Application name not specified"

echo_info "Using application name: $app_name"
echo_info "Generating aws-exports.js..."

profile=""
if [ ! -z $profile_name ]; then
  echo_info "Using profile $profile_name"
  profile="--profile $profile_name"
fi

stack_name_suffix="$app_name"

# Fetch User Interface params
ui_stack_name="aws-sample-$stack_name_suffix"
ui_stack_outputs=$(aws cloudformation describe-stacks --stack-name $ui_stack_name --query 'Stacks[0].Outputs' --output json --region $default_region $profile || echo "")

user_pool_client_id=$(jq -r '.[] | select(.OutputKey=="icwebclientidoutput") | .OutputValue' <<< $ui_stack_outputs)
cdn_fqdn=$(jq -r '.[] | select(.OutputKey=="cdnfqdnoutput") | .OutputValue' <<< $ui_stack_outputs)
identity_pool_id=$(jq -r '.[] | select(.OutputKey=="icidentitypooloutput") | .OutputValue' <<< $ui_stack_outputs)
user_pool_id=$(jq -r '.[] | select(.OutputKey=="userpooloutputid") | .OutputValue' <<< $ui_stack_outputs)
user_pool_fqdn=$(jq -r '.[] | select(.OutputKey=="userpooloutputdomain") | .OutputValue' <<< $ui_stack_outputs)

user_pool_client_redirect_url="https://$cdn_fqdn"
cookie_domain="$cdn_fqdn"

if [ "$UPLOAD_ENV" != "remote" ]; then
  echo_info "Configuring for localhost..."
  user_pool_client_redirect_url="http://localhost:3000"
  cookie_domain="localhost"
fi

# Output src/aws-exports.js

cat << EOF > src/aws-exports.js
const awsmobile = {
  Auth: {
    identityPoolId: '$identity_pool_id',
    region: 'us-east-1',
    userPoolId: '$user_pool_id',
    userPoolWebClientId: '$user_pool_client_id',
    mandatorySignIn: true,
    oauth: {
      domain: '$user_pool_fqdn',
      scope: ['email', 'profile', 'openid'],
      redirectSignIn: '$user_pool_client_redirect_url',
      redirectSignOut: '$user_pool_client_redirect_url',
      responseType: 'code'
    },
    cookieStorage: {
      domain: '$cookie_domain',
    },
  },
  API: {
    endpoints: [
      {
        name: 'MyAppAPI',
        endpoint: 'https://example.com',
        region: 'us-east-1'
      },
    ]
  }
};
export default awsmobile;
EOF