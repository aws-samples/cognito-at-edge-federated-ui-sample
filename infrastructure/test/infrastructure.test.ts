// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import {
  Capture, Match, Template
} from 'aws-cdk-lib/assertions';
import { App, Stack } from 'aws-cdk-lib'; 
import * as Infrastructure from '../lib/infrastructure-stack';

class FEStack {

  private static _stack?: Stack;

  static get() {
    if (FEStack._stack === undefined) {
      const app = new App();

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
  const totalExpectedBuckets = 2;

  // ASSERT
  const template = Template.fromStack(stack);
  template.resourceCountIs('AWS::S3::Bucket', totalExpectedBuckets);
});

test('S3 bucket should be private', () => {
  // ARRANGE

  // ACT
  const stack = FEStack.get();

  // ASSERT
  const template = Template.fromStack(stack);
  template.hasResourceProperties('AWS::S3::Bucket', 
    Match.objectLike(
      {
        BucketName: { 'Fn::Join': [ '', [ 'ui-test-us-east-1-', { Ref: 'AWS::AccountId' } ] ] },
        AccessControl: 'Private',
        PublicAccessBlockConfiguration: {
          BlockPublicAcls: true,
          BlockPublicPolicy: true,
          IgnorePublicAcls: true,
          RestrictPublicBuckets: true,
        }
      }
    ));
});

test('S3 bucket should have origin access policy configured', () => {
  // ARRANGE

  // ACT
  const stack = FEStack.get();

  // ASSERT
  const template = Template.fromStack(stack);
  template.hasResourceProperties('AWS::S3::BucketPolicy', 
  Match.objectLike({
    Bucket: { Ref: Match.stringLikeRegexp('webappcdnfrontendbucket.*') },
    PolicyDocument: {
      Statement: Match.arrayWith([Match.objectLike({
        Action: 's3:GetObject',
        Principal: {
          CanonicalUser: {
            'Fn::GetAtt': [ Match.stringLikeRegexp('webappcdnfrontenddistributionOrigin.*'), 'S3CanonicalUserId' ]
          }
        }
      })])
    }
  }));
});

test('should contain one User Pool Client', () => {
  // ACT
  const stack = FEStack.get();
  const totalExpectedUserPools = 1;

  // ASSERT
  const template = Template.fromStack(stack);
  template.resourceCountIs('AWS::Cognito::UserPoolClient', totalExpectedUserPools);
});

test('User Pool Client should have a CloudFront callback url', () => {
  // ARRANGE

  // ACT
  const stack = FEStack.get();

  // ASSERT
  const template = Template.fromStack(stack);
  template.hasResourceProperties('AWS::Cognito::UserPoolClient', Match.objectLike({
    CallbackURLs: Match.arrayWith([
      {
        'Fn::Join': [
          '',
          [ 'https://',
            {
              'Fn::GetAtt': [
                Match.stringLikeRegexp('webappcdnfrontenddistribution.*'),
                'DomainName'
              ]
            }
          ] ]
      }
    ])
  }))
});

test('User Pool Client should be configured only with MyCorpOIDC identity provider', () => {
  // ARRANGE

  // ACT
  const stack = FEStack.get();

  // ASSERT
  const template = Template.fromStack(stack);
  template.hasResourceProperties('AWS::Cognito::UserPoolClient', Match.objectLike({
    SupportedIdentityProviders: Match.arrayWith([ Match.objectLike({ Ref: Match.stringLikeRegexp('webuserpooloidcprovider.*') }) ]),
  }));
});

test('User Pool Client should be configured with authorization code grant flow only', () => {
  // ARRANGE

  // ACT
  const stack = FEStack.get();

  // ASSERT
  const template = Template.fromStack(stack);
  template.hasResourceProperties('AWS::Cognito::UserPoolClient', Match.objectLike({
    AllowedOAuthFlows: [ 'code' ],
  }));
});

test('User Pool Client should be configured with explicit auth flows', () => {
  // ARRANGE

  // ACT
  const stack = FEStack.get();

  // ASSERT
  const template = Template.fromStack(stack);
  template.hasResourceProperties('AWS::Cognito::UserPoolClient', Match.objectLike({
    ExplicitAuthFlows: [ 'ALLOW_USER_PASSWORD_AUTH', 'ALLOW_USER_SRP_AUTH', 'ALLOW_REFRESH_TOKEN_AUTH' ],
  }));
});

test('User Pool Client should be configured with openid, email and profile scopes.', () => {
  // ARRANGE

  // ACT
  const stack = FEStack.get();

  // ASSERT
  const template = Template.fromStack(stack);
  template.hasResourceProperties('AWS::Cognito::UserPoolClient', Match.objectLike({
    AllowedOAuthScopes: [ 'openid', 'email', 'profile' ],
  }));
});


test('should have ACL', () => {
  // ARRANGE

  // ACT
  const stack = FEStack.get();

  // ASSERT
  const template = Template.fromStack(stack);
  template.hasResourceProperties('AWS::WAFv2::WebACL', Match.objectLike({
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
  const template = Template.fromStack(stack);
  template.resourceCountIs('AWS::CloudFront::Distribution', expectedDistributionCount);
});

test('CloudFront distribution should have WAF configured', () => {
  // ARRANGE

  // ACT
  const stack = FEStack.get();

  // ASSERT
  const template = Template.fromStack(stack);
  template.hasResourceProperties('AWS::CloudFront::Distribution', Match.objectLike({
    DistributionConfig: { WebACLId: { 'Fn::GetAtt': [ Match.stringLikeRegexp('webappcdnfrontendwafacl.*'), 'Arn' ] } }
  }));
});

test('CloudFront distribution should have Lambda@Edge auth lambda', () => {
  // ARRANGE

  // ACT
  const stack = FEStack.get();

  // ASSERT
  const template = Template.fromStack(stack);
  template.hasResourceProperties('AWS::CloudFront::Distribution', Match.objectLike({
    DistributionConfig: {
      DefaultCacheBehavior: {
        LambdaFunctionAssociations: [{
          EventType: 'viewer-request',
          LambdaFunctionARN: { Ref: Match.stringLikeRegexp('webappcdnauthhandler.*') }
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
  const template = Template.fromStack(stack);
  template.hasOutput('icwebclientidoutput', Match.objectLike({}));
  template.hasOutput('cdnfqdnoutput', Match.objectLike({}));
  template.hasOutput('cdndistributionidoutput', Match.objectLike({}));
  template.hasOutput('icfrontends3output', Match.objectLike({}));
  template.hasOutput('icidentitypooloutput', Match.objectLike({}));
});