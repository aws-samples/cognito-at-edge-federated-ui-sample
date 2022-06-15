// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { Construct } from 'constructs';
import { Stack, RemovalPolicy, Duration } from 'aws-cdk-lib'; 
import { 
  aws_s3 as s3,
  aws_cloudfront as cloudfront,
  aws_cloudfront_origins as origins,
  aws_wafv2 as wafv2,
  aws_lambda_nodejs as lambda_node,
  aws_ssm as ssm,
  aws_iam as iam,
  aws_lambda as lambda,
} from 'aws-cdk-lib'; 

import fs from 'fs';
import { WebUserPool } from './app-user-pool';

enum HttpStatus {
  OK = 200,
  Unauthorized = 403,
  NotFound = 404
}

const EMPTY_ARRAY_COUNT = 0;

export class AppCdn extends Construct {
  private readonly _appName: string;
  private readonly _frontendS3Bucket: s3.Bucket;
  private readonly _accessLogBucket: s3.Bucket;
  private _lambdaAtEdge: lambda_node.NodejsFunction;
  private _wafACL: wafv2.CfnWebACL;
  private _distribution: cloudfront.Distribution;

  constructor(scope: Construct, id: string, props: {
    appName: string,
  }) {
    super(scope, id);

    this._appName = props.appName;

    const stack = Stack.of(this);

    this._accessLogBucket = new s3.Bucket(this, 'access-log-bucket', {
      accessControl: s3.BucketAccessControl.LOG_DELIVERY_WRITE,
      bucketName: `${stack.stackName}-${stack.region}-${stack.account}-logs`,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      serverAccessLogsPrefix: 'access-log-bucket/',
    })

    /* S3 bucket for react app CDN */
    this._frontendS3Bucket = new s3.Bucket(this, 'frontend-bucket', {
      accessControl: s3.BucketAccessControl.PRIVATE,
      bucketName: `${stack.stackName}-${stack.region}-${stack.account}`,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      serverAccessLogsBucket: this._accessLogBucket,
      serverAccessLogsPrefix: 'frontent-bucket/',
    });
  }

  withWAF(ipGreenlist: string[]): AppCdn {

    if (ipGreenlist.length === EMPTY_ARRAY_COUNT) {
      return this;
    }

    const stack = Stack.of(this);

    const wafIPSet = new wafv2.CfnIPSet(this, 'frontend-waf-ipset', {
      name: `${stack.stackName}-corporate-ip-space`,
      description: 'My Corporate IP Space',
      scope: 'CLOUDFRONT',
      ipAddressVersion: 'IPV4',
      addresses: ipGreenlist
    });

    const wafCorporateRulePriority = 0;

    this._wafACL = new wafv2.CfnWebACL(this, 'frontend-waf-acl', {
      name: `${stack.stackName}-waf-acl`,
      scope: 'CLOUDFRONT',
      defaultAction: { block: { } },
      visibilityConfig: {
        sampledRequestsEnabled: true,
        cloudWatchMetricsEnabled: true,
        metricName: 'FrontendAclMetric',
      },
      rules: [{
        name: 'AllowMyCorporateIPs',
        priority: wafCorporateRulePriority,
        action: { allow: { } },
        visibilityConfig: {
          sampledRequestsEnabled: true,
          cloudWatchMetricsEnabled: true,
          metricName: 'FrontendAclAmazonMetric',
        },
        statement: {
          ipSetReferenceStatement: {
            arn: wafIPSet.attrArn
          }
        }
      }]
    });

    return this;
  }

  withLambdaProtection(): AppCdn {
    /*  
      Lambda@Edge to check for Cognito JWT in cookies 
      Lambda@Edge does not support environment variables, 
      so putting the environment name in a file dynamically... 
    */
    const jsonIndentSpaces = 4;
    fs.writeFileSync('./lib/constructs/app-cdn.auth-handler.config.json', JSON.stringify({
      AppName: this._appName,
    }, null, jsonIndentSpaces));

    this._lambdaAtEdge = new lambda_node.NodejsFunction(this, 'auth-handler', {
      runtime: lambda.Runtime.NODEJS_14_X,
    });
    this._lambdaAtEdge.applyRemovalPolicy(RemovalPolicy.RETAIN);

    return this;
  }

  withCDN(): AppCdn {
    /* CDN */
    const defaultErrorResponseTTLSeconds = 10;
    this._distribution = new cloudfront.Distribution(this, 'frontend-distribution', {
      defaultBehavior: {
        origin: new origins.S3Origin(this._frontendS3Bucket),
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD,
        compress: false,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED_FOR_UNCOMPRESSED_OBJECTS,
        edgeLambdas: [{
          eventType: cloudfront.LambdaEdgeEventType.VIEWER_REQUEST,
          functionVersion: this._lambdaAtEdge.currentVersion
        }]
      },
      httpVersion: cloudfront.HttpVersion.HTTP1_1,
      enableIpv6: false,
      defaultRootObject: '/index.html',
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
      errorResponses: [{
        httpStatus: HttpStatus.NotFound,
        responseHttpStatus: HttpStatus.OK,
        responsePagePath: '/index.html',
        ttl: Duration.seconds(defaultErrorResponseTTLSeconds)
      }, {
        httpStatus: HttpStatus.Unauthorized,
        responseHttpStatus: HttpStatus.OK,
        responsePagePath: '/index.html',
        ttl: Duration.seconds(defaultErrorResponseTTLSeconds)
      }],
      webAclId: this._wafACL?.attrArn,
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
      logBucket: this._accessLogBucket,
      logFilePrefix: 'frontend-distribution/',
    });

    return this;
  }

  withUserPool(userPool: WebUserPool): AppCdn {

    /* Cognito web app client for Frontend */
    const callbackUrls = [`https://${this._distribution.distributionDomainName}`, 'http://localhost:3000'];

    userPool.withClient(callbackUrls);

    /*  
      CloudFront Lambda@Edge does not support environment variables. 
      For this reason they will be fetched from SSM by the Lambda@Edge during runtime. 
    */
    const userPoolParam = new ssm.StringParameter(this, 'user-pool-id', {
      parameterName: `/${this._appName}/user-pool-id`,
      stringValue: userPool.getUserPoolId(),
    });

    const userPoolClientParam = new ssm.StringParameter(this, 'user-pool-domain-prefix', {
      parameterName: `/${this._appName}/user-pool-domain`,
      stringValue: userPool.getUserPoolLoginFQDN(),
    });

    const cognitoClientParamName = `/${this._appName}/user-pool-client-id`;
    new ssm.StringParameter(this, 'user-pool-client-id', {
      parameterName: cognitoClientParamName,
      stringValue: userPool.getUserPoolClientId(),
    });

    const stack = Stack.of(this);

    this._lambdaAtEdge.addToRolePolicy(new iam.PolicyStatement({
      actions: ['ssm:GetParameter'],
      resources: [
        userPoolParam.parameterArn,
        userPoolClientParam.parameterArn,
        `arn:aws:ssm:${stack.region}:${stack.account}:parameter${cognitoClientParamName}`
      ]
    }));

    return this;
  }

  getDomainName(): string {
    return this._distribution.domainName;
  }

  getDistributionId(): string {
    return this._distribution.distributionId;
  }

  getBucketName(): string {
    return this._frontendS3Bucket.bucketName;
  }

}