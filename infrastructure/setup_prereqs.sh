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

echo_info "Checking for required Secret Manager parameter..."

app_name=$1
profile_name=$2

fail_if_empty "$app_name" "App name not specified"

profile=""
if [ ! -z $profile_name ]; then
  echo_info "Using profile $profile_name"
  profile="--profile $profile_name"
fi

# Check if OIDC secret is defined in the Secrets Manager.
oidc_secret_name="${app_name}/oidc"
oidc_secret=$(aws secretsmanager describe-secret --secret-id "${oidc_secret_name}" $profile --region us-east-1 || echo "")

if [ -z "$oidc_secret" ]; then
  echo_info "OIDC Params not set."
  echo_info "Enter client ID:"
  read user_client_id
  echo_info "Enter client Secret:"
  read user_client_secret
  echo_info "Enter issuer:"
  read user_issuer

  aws secretsmanager create-secret --name "${oidc_secret_name}" $profile --region us-east-1 --secret-string "{\"ClientID\":\"$user_client_id\",\"ClientSecret\":\"$user_client_secret\",\"Issuer\":\"$user_issuer\"}"
fi

echo_info "All set."