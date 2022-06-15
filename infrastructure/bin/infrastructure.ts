#!/usr/bin/env node
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import 'source-map-support/register';
import { App } from 'aws-cdk-lib'; 
import { InfrastructureStack } from '../lib/infrastructure-stack';
import { getStackName } from './conventions';

const app = new App();
const appName = app.node.tryGetContext('app-name');
let wafIpGreenlist: string[] = app.node.tryGetContext('waf-ip-greenlist');

if (appName === undefined ||
  appName === '') {
  throw new Error('Must specify app name: -c app-name=my-web-app');
}

if (wafIpGreenlist === undefined) {
  wafIpGreenlist = [];
}

new InfrastructureStack(app, 'InfrastructureStack', {
  stackName: getStackName(appName),
  appName: appName,
  wafIpGreenlist: wafIpGreenlist,
  env: {
    region: 'us-east-1'
  }
});
