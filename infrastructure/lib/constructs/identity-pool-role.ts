// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import * as cdk from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';

export enum IdentityPoolRoleTypeEnum {
  Authenticated = 'authenticated',
  Unauthenticated = 'unauthenticated'
}

export class IdentityPoolRole extends cdk.Construct {

  private readonly _identityPoolRole: iam.Role;

  constructor(
    scope: cdk.Construct,
    id: string,
    props: { roleType: IdentityPoolRoleTypeEnum, identityPoolId: string }) {
    super(scope, id);

    this._identityPoolRole = new iam.Role(this, 'idp-role', {
      assumedBy: new iam.FederatedPrincipal('cognito-identity.amazonaws.com', {
        StringEquals: {
          'cognito-identity.amazonaws.com:aud': props.identityPoolId
        },
        'ForAnyValue:StringLike': {
          'cognito-identity.amazonaws.com:amr': props.roleType
        }
      }, 'sts:AssumeRoleWithWebIdentity')
    });
  }

  getUnderlyingRole(): iam.Role {
    return this._identityPoolRole;
  }
}