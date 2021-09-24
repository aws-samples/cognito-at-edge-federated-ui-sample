// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import {
  expect as expectCDK,
  haveResourceLike,
  stringLike,
  countResources,
  objectLike,
  haveOutput,
  arrayWith
} from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as Infrastructure from '../lib/infrastructure-stack';

class FEStack {

  private static _stack?: cdk.Stack;

  static get() {
    if (FEStack._stack === undefined) {
      const app = new cdk.App();

      FEStack._stack = new Infrastructure.InfrastructureStack(app, 'MyTestStack', {
        stackName: 'ui-test',
        env: {
          region: 'us-east-1'
        },
        appName: 'my-app',
        wafIpGreenlist: [ '0.0.0.0/32' ],
      });
    }

    return FEStack._stack;
  }
}

test('should contain only one S3 bucket', () => {
  // ACT
  const stack = FEStack.get();
  const totalExpectedBuckets = 1;

  // ASSERT

  expectCDK(stack).to(countResources('AWS::S3::Bucket', totalExpectedBuckets));
});

test('S3 bucket should be private', () => {
  // ARRANGE

  // ACT
  const stack = FEStack.get();

  // ASSERT
  expectCDK(stack).to(haveResourceLike('AWS::S3::Bucket', {
    BucketName: { 'Fn::Join': [ '', [ 'ui-test-us-east-1-', { Ref: 'AWS::AccountId' } ] ] },
    AccessControl: 'Private',
    PublicAccessBlockConfiguration: {
      BlockPublicAcls: true,
      BlockPublicPolicy: true,
      IgnorePublicAcls: true,
      RestrictPublicBuckets: true,
    }
  }));
});

test('S3 bucket should have origin access policy configured', () => {
  // ARRANGE

  // ACT
  const stack = FEStack.get();

  // ASSERT
  expectCDK(stack).to(haveResourceLike('AWS::S3::BucketPolicy', {
    Bucket: { Ref: stringLike('webappcdnfrontendbucket*') },
    PolicyDocument: {
      Statement: arrayWith(objectLike({
        Action: 's3:GetObject',
        Principal: {
          CanonicalUser: {
            'Fn::GetAtt': [ stringLike('webappcdnfrontenddistributionOrigin*'), 'S3CanonicalUserId' ]
          }
        }
      }))
    }
  }));
});

test('should contain one User Pool Client', () => {
  // ACT
  const stack = FEStack.get();
  const totalExpectedUserPools = 1;

  // ASSERT

  expectCDK(stack).to(countResources('AWS::Cognito::UserPoolClient', totalExpectedUserPools));
});

test('User Pool Client should have a CloudFront callback url', () => {
  // ARRANGE

  // ACT
  const stack = FEStack.get();

  // ASSERT
  expectCDK(stack).to(haveResourceLike('AWS::Cognito::UserPoolClient', {
    CallbackURLs: [
      {
        'Fn::Join': [
          '',
          [ 'https://',
            {
              'Fn::GetAtt': [
                stringLike('webappcdnfrontenddistribution*'),
                'DomainName'
              ]
            }
          ] ]
      }
    ]
  }));
});

test('User Pool Client should be configured only with MyCorpOIDC identity provider', () => {
  // ARRANGE

  // ACT
  const stack = FEStack.get();

  // ASSERT
  expectCDK(stack).to(haveResourceLike('AWS::Cognito::UserPoolClient', {
    SupportedIdentityProviders: [ objectLike({ Ref: stringLike('webuserpooloidcprovider*') }) ],
  }));
});

test('User Pool Client should be configured with authorization code grant flow only', () => {
  // ARRANGE

  // ACT
  const stack = FEStack.get();

  // ASSERT
  expectCDK(stack).to(haveResourceLike('AWS::Cognito::UserPoolClient', {
    AllowedOAuthFlows: [ 'code' ],
  }));
});

test('User Pool Client should be configured with explicit auth flows', () => {
  // ARRANGE

  // ACT
  const stack = FEStack.get();

  // ASSERT
  expectCDK(stack).to(haveResourceLike('AWS::Cognito::UserPoolClient', {
    ExplicitAuthFlows: [ 'ALLOW_USER_PASSWORD_AUTH', 'ALLOW_USER_SRP_AUTH', 'ALLOW_REFRESH_TOKEN_AUTH' ],
  }));
});

test('User Pool Client should be configured with openid, email and profile scopes.', () => {
  // ARRANGE

  // ACT
  const stack = FEStack.get();

  // ASSERT
  expectCDK(stack).to(haveResourceLike('AWS::Cognito::UserPoolClient', {
    AllowedOAuthScopes: [ 'openid', 'email', 'profile' ],
  }));
});


test('should have ACL', () => {
  // ARRANGE

  // ACT
  const stack = FEStack.get();

  // ASSERT
  expectCDK(stack).to(haveResourceLike('AWS::WAFv2::WebACL', {
    DefaultAction: {
      Block: {}
    }
  }));
});

test('should have CloudFront distribution', () => {
  // ARRANGE
  const expectedDistributionCount = 1;

  // ACT
  const stack = FEStack.get();

  // ASSERT
  expectCDK(stack).to(countResources('AWS::CloudFront::Distribution', expectedDistributionCount));
});

test('CloudFront distribution should have WAF configured', () => {
  // ARRANGE

  // ACT
  const stack = FEStack.get();

  // ASSERT
  expectCDK(stack).to(haveResourceLike('AWS::CloudFront::Distribution', {
    DistributionConfig: { WebACLId: { 'Fn::GetAtt': [ stringLike('webappcdnfrontendwafacl*'), 'Arn' ] } }
  }));
});

test('CloudFront distribution should have Lambda@Edge auth lambda', () => {
  // ARRANGE

  // ACT
  const stack = FEStack.get();

  // ASSERT
  expectCDK(stack).to(haveResourceLike('AWS::CloudFront::Distribution', {
    DistributionConfig: {
      DefaultCacheBehavior: {
        LambdaFunctionAssociations: [{
          EventType: 'viewer-request',
          LambdaFunctionARN: { Ref: stringLike('webappcdnauthhandler*') }
        }]
      }
    }
  }));
});

test('should contain required output parameters', () => {
  // ARRANGE

  // ACT
  const stack = FEStack.get();

  // ASSERT
  expectCDK(stack).to(haveOutput({
    outputName: 'icwebclientidoutput',
  }));
  expectCDK(stack).to(haveOutput({
    outputName: 'cdnfqdnoutput',
  }));
  expectCDK(stack).to(haveOutput({
    outputName: 'cdndistributionidoutput',
  }));
  expectCDK(stack).to(haveOutput({
    outputName: 'icfrontends3output',
  }));
  expectCDK(stack).to(haveOutput({
    outputName: 'icidentitypooloutput',
  }));
});