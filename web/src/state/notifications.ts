// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { FlashbarProps } from '@awsui/components-react';
import { atom } from 'recoil';


export type NotificationItem = FlashbarProps.MessageDefinition & {
  id: string,
};

const notificationsState = atom<NotificationItem[]>({
  key: 'notifications',
  default: []
});

export { notificationsState };