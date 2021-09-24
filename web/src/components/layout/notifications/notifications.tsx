// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { Flashbar } from '@awsui/components-react';
import { useNotifications } from './notifications.logic';

const notifications = (): JSX.Element => {

  const { notifications } = useNotifications();

  return (
    <Flashbar items={notifications} />
  );
};

export { notifications as Notifications };