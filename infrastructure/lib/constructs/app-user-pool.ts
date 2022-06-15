// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { Construct } from 'constructs';
import { Stack, SecretValue } from 'aws-cdk-lib'; 
import { 
  aws_cognito as cognito,
  aws_iam as iam,
} from 'aws-cdk-lib'; 
import { IdentityPool } from './identity-pool';
import { ProviderAttribute, UserPoolIdentityProviderOidc } from 'aws-cdk-lib/aws-cognito';


export class WebUserPool extends Construct {

  private readonly _userPool: cognito.UserPool;
  private readonly _appName: string;
  private _identityPool: IdentityPool;
  private _userPoolClient: cognito.UserPoolClient;
  private _userPoolDomain: cognito.UserPoolDomain;

  constructor(scope: Construct, id: string, props: {
    appName: string,
  }) {
    super(scope, id);

    this._appName = props.appName;

    this._userPool = new cognito.UserPool(this, 'my-app-user-pool', {
      userPoolName: `aws-sample-${this._appName.replace(/[^a-zA-Z0-9]/gu, '-')}-user-pool`,
      standardAttributes: {
        email: {
          required: true,
          mutable: true
        }
      },
      signInAliases: {
        username: false,
        email: true
      },
      autoVerify: {
        email: true
      },
    });

    const cfnConstruct = this._userPool.node.defaultChild as cognito.CfnUserPool;
    cfnConstruct.userPoolAddOns = {
      advancedSecurityMode: 'ENFORCED',
    };

  }

  withDomainPrefix(domainPrefix: string): WebUserPool {

    this._userPoolDomain = this._userPool.addDomain('my-app-cognito-domain', {
      cognitoDomain: {
        domainPrefix,
      },
    });

    return this;
  }

  withIdentityProvider(identityProviderSecretName: string): WebUserPool {

    this._userPool.registerIdentityProvider(new UserPoolIdentityProviderOidc(this, 'oidc-provider', {
      userPool: this._userPool,
      name: 'MyCorpOIDC',
      clientId: SecretValue.
        secretsManager(identityProviderSecretName, {
          jsonField: 'ClientID'
        }).toString(),
      clientSecret: SecretValue.
        secretsManager(identityProviderSecretName, {
          jsonField: 'ClientSecret'
        }).toString(),
      issuerUrl: SecretValue.
        secretsManager(identityProviderSecretName, {
          jsonField: 'Issuer'
        }).toString(),
      scopes: ['openid', 'email'],
      attributeMapping: {
        email: ProviderAttribute.other('email'),
      },
    }));

    return this;
  }

  withClient(callbackUrls: string[]): WebUserPool {

    this._userPoolClient = this._userPool.addClient('web-client', {
      userPoolClientName: `${this._appName.replace(/[^a-zA-Z0-9]/gu, '-')}-web-client`,
      supportedIdentityProviders: this._userPool.identityProviders.map(
        idp => cognito.UserPoolClientIdentityProvider.custom(idp.providerName)
      ),
      authFlows: {
        adminUserPassword: false,
        custom: false,
        userPassword: true,
        userSrp: true
      },
      disableOAuth: false,
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
          implicitCodeGrant: false,
          clientCredentials: false
        },
        scopes: [ cognito.OAuthScope.OPENID, cognito.OAuthScope.EMAIL, cognito.OAuthScope.PROFILE ],
        callbackUrls,
        logoutUrls: callbackUrls,
      },
    });

    return this;
  }

  withApiAccess(restApiId: string): WebUserPool {

    const stack = Stack.of(this);

    /* Identity Pool for REST api access */

    this._identityPool = new IdentityPool(this, 'my-app-identity-pool', {
      identityPoolName: `aws_sample_${this._appName.replace(/[^a-zA-Z0-9]/gu, '_')}_identity_pool`,
      userPoolProviderName: this._userPool.userPoolProviderName,
      userPoolClientId: this._userPoolClient.userPoolClientId,
      /* 
        Grant permissions for every authenticated user to call REST apis. 
        This policy will grant execute permissions on a specific API, all stages, methods, and resources.
        See 'Control access for invoking an API ' for more information:  
        https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-control-access-using-iam-policies-to-invoke-api.html 
      */
      authenticatedRolePolicies: [new iam.PolicyStatement({
        actions: ['execute-api:Invoke'],
        resources: [`arn:aws:execute-api:${stack.region}:${stack.account}:${restApiId}/*/*/*`]
      })]
    });

    return this;
  }

  getUserPoolId(): string {
    return this._userPool.userPoolId;
  }

  getUserPoolLoginFQDN(): string {
    const stack = Stack.of(this);

    return `${this._userPoolDomain.domainName}.auth.${stack.region}.amazoncognito.com`;
  }

  getUserPoolClientId(): string {
    return this._userPoolClient.userPoolClientId;
  }

  getProviderName(): string {
    return this._userPool.userPoolProviderName;
  }

  getIdentityPoolId(): string {
    return this._identityPool.getUnderlyingIdentityPool().ref;
  }

}