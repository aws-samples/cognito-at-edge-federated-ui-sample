// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import * as cdk from '@aws-cdk/core';
import * as cognito from '@aws-cdk/aws-cognito';
import * as iam from '@aws-cdk/aws-iam';
import { IdentityPoolRole, IdentityPoolRoleTypeEnum } from './identity-pool-role';

export interface IdentityPoolProps {
  identityPoolName: string,
  userPoolClientId: string,
  userPoolProviderName: string,
  authenticatedRolePolicies: iam.PolicyStatement[],
}

export class IdentityPool extends cdk.Construct {

  private readonly _identityPool: cognito.CfnIdentityPool;

  constructor(scope: cdk.Construct, id: string, props: IdentityPoolProps) {
    super(scope, id);

    this._identityPool = new cognito.CfnIdentityPool(this, 'identity-pool', {
      allowUnauthenticatedIdentities: false,
      cognitoIdentityProviders: [ {
        clientId: props.userPoolClientId, providerName: props.userPoolProviderName
      } ],
      identityPoolName: props.identityPoolName,
    });

    const authenticatedRole = new IdentityPoolRole(this, 'idp-auth-role', {
      roleType: IdentityPoolRoleTypeEnum.Authenticated,
      identityPoolId: this._identityPool.ref
    });

    props.authenticatedRolePolicies.forEach(p => authenticatedRole.getUnderlyingRole().addToPolicy(p));

    new cognito.CfnIdentityPoolRoleAttachment(this, 'identity-pool-roles', {
      identityPoolId: this._identityPool.ref,
      roles: {
        authenticated: authenticatedRole.getUnderlyingRole().roleArn,
      },
      roleMappings: {
        userPool: {
          identityProvider: `${props.userPoolProviderName}:${props.userPoolClientId}`,
          ambiguousRoleResolution: 'AuthenticatedRole',
          type: 'Token'
        }
      }
    });
  }

  getUnderlyingIdentityPool(): cognito.CfnIdentityPool {
    return this._identityPool;
  }
}

