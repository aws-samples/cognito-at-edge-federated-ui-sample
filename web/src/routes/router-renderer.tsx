// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { Redirect, Route } from 'react-router-dom';
import { FC } from 'react';

/* eslint @typescript-eslint/no-explicit-any: "off", no-implicit-coercion: "off" */

export interface RouteItem {
  path: string,
  name: string,
  isExact?: boolean,
  redirectTo?: string,
  component: FC<any>,
}

interface Props {
  authRoutes: RouteItem[],
}

const routeRenderer: FC<Props> = ({
  authRoutes
}) => {

  return (
    <>
      {authRoutes.map(({ path, isExact, redirectTo, component }, key) => <Route
        exact={!!isExact}
        path={path}
        key={key}
        component={component}
      >
        {!!redirectTo &&
          <>
            <Redirect to={redirectTo} />
          </>
        }
      </Route>

      )}
    </>
  );
};

export { routeRenderer as RouteRenderer };