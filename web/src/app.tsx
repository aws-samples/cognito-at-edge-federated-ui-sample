// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import './app.css';

import '@awsui/global-styles/index.css';
import { PageHeader } from './components/layout/page-header/page-header';

import { useAuthenticator } from './hooks/';
import { RouterAuth, RouterNoAuth } from './routes';

function app(): JSX.Element {
  const { user, initiateSignOut, initiateAuth } = useAuthenticator();

  return (
    <>
      <div id="b" className={'awsui awsui-motion'}>
        <PageHeader
          onSignInClick={initiateAuth}
          onSignOutClick={initiateSignOut}
        />
        {Boolean(user?.user) && authenticatedApp()}
        {!user?.user && unauthenticatedApp()}
      </div>
    </>
  );

  function unauthenticatedApp() {
    return <RouterNoAuth />;
  }

  function authenticatedApp() {
    return <RouterAuth />;
  }
}

export default app;
