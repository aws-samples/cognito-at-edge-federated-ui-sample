// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { FC } from 'react';
import { Button, Link } from '@awsui/components-react';
import './page-header.scss';
import { loggedInUserState } from '../../../state/';
import { useRecoilState } from 'recoil';
import { UserSelector } from './user-selector';

type Props = {
  onSignInClick: () => void,
  onSignOutClick: () => void,
};

/* eslint complexity: "off", @typescript-eslint/no-magic-numbers: "off" */
const pageHeader: FC<Props> = ({
  onSignInClick,
  onSignOutClick
}) => {
  const [user] = useRecoilState(loggedInUserState);

  return (
    <header id="h">
      <ul className="menu-list">
        <li className="title">
          <Link variant="primary" href="/">Sample Application</Link>
        </li>
        <li className="ml-auto"></li>
        {!!user?.user &&
          <>
            <li className="separated">
              <UserSelector currentUser={user?.user} onLogoutUser={onSignOutClick} />
            </li>
          </>
        }
        {!user?.user &&
          <>
            <li className="separated">
              <Button variant="link" onClick={onSignInClick}>Login</Button>
            </li>
          </>
        }
      </ul>
    </header>
  );
};

export { pageHeader as PageHeader };