// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { SideNavigation, SideNavigationProps } from '@awsui/components-react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { navigate } from '../../../utils';

import './navigation.scss';
import { FC } from 'react';
import { UserType } from '../../../state';

/* eslint @typescript-eslint/no-explicit-any: "off" */
interface Props extends RouteComponentProps<any> {
  user?: UserType,
  navigationItems: SideNavigationProps.Item[],
}

const navigation: FC<Props> = ({
  user,
  navigationItems,
  history
}) => {
  if (user) {
    return (

      <SideNavigation
        header={{ text: 'Sample Application', href: '/' }}
        items={navigationItems}
        activeHref={`/${history.location.pathname.split('/')[1]}`}
        onFollow={evt => navigate(history, evt, evt.detail.href)}
      />
    );
  }

  return (
    <SideNavigation
      header={{ text: 'Sample Application', href: '/' }} items={navigationItems}
    />
  );

};

export default withRouter(navigation);
