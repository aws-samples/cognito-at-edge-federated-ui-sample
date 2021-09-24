// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
type AuthenticatorLogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'silent';

type AuthenticatorParams = {
  region: string,
  userPoolId: string,
  userPoolAppId: string,
  userPoolDomain: string,
  cookieExpirationDays?: number,
  logLevel?: AuthenticatorLogLevel,
};

declare module 'cognito-at-edge' {
  import { CloudFrontRequestEvent, CloudFrontRequestResult } from 'aws-lambda';

  export class Authenticator {
    constructor(params: AuthenticatorParams);

    handle(event: CloudFrontRequestEvent): Promise<CloudFrontRequestResult>;
  }
}

