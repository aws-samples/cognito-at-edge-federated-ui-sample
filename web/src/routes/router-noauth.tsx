// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { Switch } from 'react-router-dom';
import { HomePage } from '../components/pages/home/home';
import { RouteItem, RouteRenderer } from './router-renderer';

const routerNoAuth = (): JSX.Element => {

  const authRoutes: RouteItem[] = [
    { path: '/', name: 'HomePage', component: HomePage },
  ];

  return (
    <Switch>
      <RouteRenderer authRoutes={authRoutes}/>
    </Switch>
  );
};

export { routerNoAuth as RouterNoAuth };
