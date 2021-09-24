// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { v4 as generateGuid } from 'uuid';
import { NotificationItem, notificationsState } from '../../../state';

const i18n = {
  dismissLabel: 'Dismiss'
};

type NotificationContents = {
  header: string,
  content: string,
};

type NotificationsType = {
  notifications: NotificationItem[],
  showErrorNotification({ header, content }: NotificationContents): void,
};

function useNotifications(): NotificationsType {
  const notifications = useRecoilValue(notificationsState);
  const setNotifications = useSetRecoilState(notificationsState);

  return {
    notifications,
    showErrorNotification,
  };

  function showErrorNotification({ header, content }: NotificationContents): void {
    const id = generateGuid();

    setNotifications((oldNotifications) => [{
      header,
      type: 'error',
      content,
      dismissible: true,
      dismissLabel: i18n.dismissLabel,
      id,
      onDismiss: () => removeNotification(id),
    }, ...oldNotifications]);
  }

  function removeNotification(id: string): void {
    setNotifications((oldNotifications) => oldNotifications.filter(n => n.id !== id));
  }
}

export { useNotifications };