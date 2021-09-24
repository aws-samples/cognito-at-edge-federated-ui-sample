// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import {
  CfnUserPoolIdentityProvider, UserPoolIdentityProviderProps
} from '@aws-cdk/aws-cognito';
import {
  UserPoolIdentityProviderBase
} from '@aws-cdk/aws-cognito/lib/user-pool-idps/private/user-pool-idp-base';
import { Construct } from '@aws-cdk/core';

interface UserPoolIdentityProviderOIDCProps extends UserPoolIdentityProviderProps {
  providerName: string,
  clientId: string,
  clientSecret: string,
  issuerUrl: string,
  scopes: string,
}

export class UserPoolIdentityProviderOpenId extends UserPoolIdentityProviderBase {
  public readonly providerName: string;

  constructor(scope: Construct, id: string, props: UserPoolIdentityProviderOIDCProps) {
    super(scope, id, props);

    const resource = new CfnUserPoolIdentityProvider(this, 'Resource', {
      userPoolId: props.userPool.userPoolId,
      providerName: props.providerName,
      providerType: 'OIDC',
      attributeMapping: {
        email: 'email',
      },
      providerDetails: {
        client_id: props.clientId,
        client_secret: props.clientSecret,
        attributes_request_method: 'GET',
        oidc_issuer: props.issuerUrl,
        authorize_scopes: props.scopes
      }
    });

    this.providerName = super.getResourceNameAttribute(resource.ref);

  }
}