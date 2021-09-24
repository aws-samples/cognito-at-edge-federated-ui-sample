# Infrastructure Code for User Interface

This is an infrastructure CDK template for User Interface CloudFormation stack. 

## Deploying the stack

1. Install dependencies. 
   If you use NPM:
   ```
   npm install
   ```

   Yarn:
   ```
   yarn install
   ```

1. Bootstrap CDK into your account and region:
   ```
   cdk bootstrap aws://12345678900/us-east-1
   ```

2. Setup the prerequisites using a unique app name without whitespace:
   ```
   ./setup_prereqs.sh my-test-app aws-profile-name
   ```

This script will ask for OIDC client ID, secret and issuer. It will then store them in a Secrets Manager secret for the stack to use. 

3. Update configuration in the `cdk.json` file. Set the following parameters:
  * `"app-name"`: `"my-test-app"` - name of your application without whitespaces. This must be the same application name from step 2 and it must be globally unique, as it will be used in the Cognito domain prefix.
  * `"waf-ip-greenlist"`: `[ "169.254.0.0/24" ]` - list of your corporate IP address space (optional). WAF will not be configured if you keep this array empty. 

4. Run the following command to deploy the CloudFormation stack:
   ```
   cdk deploy --profile aws-profile-name
   ```

   This will deploy an S3 bucket, CloudFront distribution and a User Pool client for the frontend app to use in us-east-1 region.

## Deleting the stack

Lambda@Edge functions can only be deleted after all of the replicas have been deleted by CloudFront. For this reason, Lambda@Edge function in this CDK template is configured with `RETAIN` removal policy, which means, that it has to be deleted manually after destroying the CloudFormation stack (see [Deleting Lambda@Edge Functions and Replicas](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-edge-delete-replicas.html)).

1. Note the physical ID of the Lambda@Edge function in the Resources tab of the CloudFormation stack details.  
2. Run the following command to destroy the CloudFormation stack:
   ```
   cdk destroy --profile aws-profile-name
   ```
3. After a few hours, all the Lambda@Edge replicas will be automatically deleted. In the AWS Console, find the Lambda with the ID from step 1, and delete it manually. 
4. Remove the following secret from the Secrets Manager, containing the corporate OIDC configuration: `{app_name}/oidc`, replacing the `{app_name}` with a chosen `app-name` configuration value in the `cdk.json` file.