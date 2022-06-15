// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { Stack, StackProps, CfnOutput } from 'aws-cdk-lib'; 
import { Construct } from 'constructs';
import { WebUserPool } from './constructs/app-user-pool';
import { AppCdn } from './constructs/app-cdn';

export class InfrastructureStack extends Stack {

  constructor(scope: Construct, id: string, props: StackProps & {
    appName: string,
    wafIpGreenlist: string[],
  }) {
    super(scope, id, props);

    const webUserPool = new WebUserPool(this, 'web-user-pool', {
      appName: props.appName,
    }).
      withDomainPrefix(`${props.appName}-login`).
      withIdentityProvider(`${props.appName}/oidc`);

    const cdn = new AppCdn(this, 'web-app-cdn', {
      appName: props.appName,
    }).
      withWAF(props.wafIpGreenlist).
      withLambdaProtection().
      withCDN().
      withUserPool(webUserPool);

    webUserPool.withApiAccess('ApiIDPlaceholder');

    /* Outputs */
    new CfnOutput(this, 'ic-web-client-id-output', {
      exportName: `${this.stackName}-IcWebClientId`,
      value: webUserPool.getUserPoolClientId()
    });

    new CfnOutput(this, 'cdn-fqdn-output', {
      exportName: `${this.stackName}-CdnFqdn`,
      value: cdn.getDomainName(),
    });

    new CfnOutput(this, 'cdn-distribution-id-output', {
      exportName: `${this.stackName}-CdnDistributionId`,
      value: cdn.getDistributionId(),
    });

    new CfnOutput(this, 'ic-frontend-s3-output', {
      exportName: `${this.stackName}-S3BucketName`,
      value: cdn.getBucketName(),
    });

    new CfnOutput(this, 'ic-identity-pool-output', {
      exportName: `${this.stackName}-IdentityPool`,
      value: webUserPool.getIdentityPoolId(),
    });

    new CfnOutput(this, 'user-pool-output-id', {
      exportName: `${this.stackName}-UserPoolId`,
      value: webUserPool.getUserPoolId(),
    });

    new CfnOutput(this, 'user-pool-output-domain', {
      exportName: `${this.stackName}-UserPoolDomain`,
      value: webUserPool.getUserPoolLoginFQDN()
    });
  }
}

