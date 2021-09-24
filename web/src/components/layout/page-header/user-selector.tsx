// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { FC } from 'react';
import { ButtonDropdown } from '@awsui/components-react';
import { ButtonDropdownProps } from '@awsui/components-react/button-dropdown/interfaces';

import './page-header.scss';
import { UserType } from '../../../state';

type UserSelectorProps = {
  currentUser: UserType,
  onLogoutUser: () => void,
};

const userSelector: FC<UserSelectorProps> = ({
  currentUser,
  onLogoutUser
}) => {

  const userItems: ReadonlyArray<ButtonDropdownProps.Item | ButtonDropdownProps.ItemGroup> = [
    { text: 'Properties', id: 'properties', disabled: true },
    { text: 'Logout', id: 'logout', disabled: false }
  ];

  function handleItemClick() {
    onLogoutUser();
  }

  return (
    <ButtonDropdown
      items={userItems}
      variant='normal'
      onItemClick={handleItemClick}
    >
      {currentUser}
    </ButtonDropdown>
  );
};

export { userSelector as UserSelector };