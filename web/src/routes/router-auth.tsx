// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { Switch } from 'react-router-dom';
import { Sample } from '../components/pages/sample/sample';
import { RouteItem, RouteRenderer } from './router-renderer';

const routerAuth = (): JSX.Element => {

  const authRoutes: RouteItem[] = [
    { path: '/sample', name: 'Sample', component: Sample, isExact: true },
    {
      path: '/',
      name: 'Sample',
      component: Sample,
      redirectTo: '/sample',
      isExact: true
    },
  ];

  return (
    <Switch>
      <RouteRenderer authRoutes={authRoutes} />
    </Switch>
  );
};

export { routerAuth as RouterAuth };
