// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { SideNavigation, SideNavigationProps } from '@awsui/components-react';

import './navigation.scss';
import { FC } from 'react';
import { UserType } from '../../../state';
import { useNavigate, useLocation } from 'react-router-dom';

/* eslint @typescript-eslint/no-explicit-any: "off" */
interface Props {
  user?: UserType,
  navigationItems: SideNavigationProps.Item[],
}

const navigation: FC<Props> = ({
  user,
  navigationItems
}) => {

  const history = useLocation();
  const navigate = useNavigate();

  if (user) {
    return (

      <SideNavigation
        header={{ text: 'Sample Application', href: '/' }}
        items={navigationItems}
        activeHref={`/${history.pathname.split('/')[1]}`}
        onFollow={evt => navigate(evt.detail.href)}
      />
    );
  }

  return (
    <SideNavigation
      header={{ text: 'Sample Application', href: '/' }} items={navigationItems}
    />
  );

};

export default navigation;
