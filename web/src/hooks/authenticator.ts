// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { Auth, Hub } from 'aws-amplify';
import { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { LoggedInUserState, loggedInUserState, UserType } from '../state';
import { ICredentials } from '@aws-amplify/core';
import { useNotifications } from '../components/layout/notifications';

/* eslint @typescript-eslint/no-explicit-any: "off", complexity: "off" */

const i18n = {
  signInFailureTitle: 'Unable to log in.',
  signInFailureText: 'There was an error while logging in: '
};

type Authenticator = {
  user: LoggedInUserState | undefined,
  initiateAuth: () => Promise<ICredentials>,
  initiateSignOut: () => Promise<any>,
};

function useAuthenticator(): Authenticator {
  const [user, setUser] = useRecoilState(loggedInUserState);
  const { showErrorNotification } = useNotifications();

  useEffect(() => {
    Hub.listen('auth', ({ payload: { event, data } }) => {
      switch (event) {
        case 'signIn':
        case 'cognitoHostedUI':
          getUser().then(userData => {
            const u = userData ? userData.userEmail as UserType : undefined;
            const lu : LoggedInUserState = { user: u };
            setUser(lu);
          });
          break;
        case 'signOut':
          setUser(undefined);
          break;
        case 'signIn_failure':
        case 'cognitoHostedUI_failure':
          showErrorNotification({
            header: i18n.signInFailureTitle,
            content: `${i18n.signInFailureText} ${data}`
          });
          break;
      }
    });

    getUser().then(userData => {
      const u = userData ? userData.userEmail as UserType : undefined;
      const lu : LoggedInUserState = { user: u };
      setUser(lu);
    });
  }, []);

  return {
    user,
    initiateAuth: () => inititateAuth(),
    initiateSignOut: () => initiateSignOut(),
  };

  function getUser() {
    return Auth.currentSession()
      .then(data => {
        const idToken = data.getIdToken();
        return {
          userEmail: idToken.payload.email
        };
      })
      .catch((err: Error) => showErrorNotification({
        header: i18n.signInFailureTitle,
        content: `${i18n.signInFailureText} ${err?.message}`
      }));
  }

  function inititateAuth() {
    return Auth.federatedSignIn();
  }

  function initiateSignOut() {
    return Auth.signOut();
  }
}

export { useAuthenticator };