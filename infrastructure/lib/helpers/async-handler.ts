// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { CloudFrontRequestEvent, CloudFrontRequestResult } from 'aws-lambda';
import { Authenticator } from 'cognito-at-edge';

/* global AuthenticatorLogLevel */

type AsyncHandlerParams = {
  region: string,
  logLevel?: AuthenticatorLogLevel,
  userPoolIdResolver: () => Promise<string>,
  userPoolClientIdResolver: () => Promise<string>,
  userPoolDomainResolver: () => Promise<string>,
};
export class AsyncHandler {

  private static _authenticatorInstance: Authenticator;

  public static async handleAsync(event: CloudFrontRequestEvent, {
    region,
    logLevel,
    userPoolIdResolver,
    userPoolClientIdResolver,
    userPoolDomainResolver
  } : AsyncHandlerParams): Promise<CloudFrontRequestResult> {

    if (AsyncHandler._authenticatorInstance === undefined) {

      const [userPoolId, userPoolAppId, userPoolDomain] = await Promise.all([
        userPoolIdResolver(),
        userPoolClientIdResolver(),
        userPoolDomainResolver()]
      );

      AsyncHandler._authenticatorInstance = new Authenticator({
        region,
        logLevel,
        userPoolId,
        userPoolAppId,
        userPoolDomain
      });
    }

    return AsyncHandler._authenticatorInstance.handle(event);
  }
}

