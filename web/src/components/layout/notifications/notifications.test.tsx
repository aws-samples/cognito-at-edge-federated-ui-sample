// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { render, screen } from '@testing-library/react';
import { RecoilRoot, SetRecoilState } from 'recoil';
import { Notifications } from '.';
import { useNotifications } from './notifications.logic';
import { renderHook, act } from '@testing-library/react-hooks';
import { notificationsState } from '../../../state';

describe('Notifications', () => {


  it('stores error notifications in memory', () => {
    // ARRANGE 
    const { result } = renderHook(() => useNotifications(), {
      wrapper: ({ children }) => <RecoilRoot>{children}</RecoilRoot>
    });

    // ACT
    act(() => {
      result.current.showErrorNotification({
        header: 'Error Header',
        content: 'Error Content',
      });
    });

    // ASSERT
    expect(result.current.notifications).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          header: 'Error Header',
          content: 'Error Content',
          dismissible: true,
          type: 'error'
        })]));
  });

  it('displays error notifications with header from memory', () => {
    // ARRANGE
    const initializeState = ({ set }: { set: SetRecoilState }) => {
      set(notificationsState, [{
        header: 'Error Header',
        content: 'Error Content',
        dismissible: true,
        type: 'error',
        id: 'test',
      }]);
    };

    // ACT
    render(<RecoilRoot initializeState={initializeState}><Notifications/></RecoilRoot>);

    // ASSERT
    let errorElement: HTMLElement | undefined = undefined;
    errorElement = screen.getByText(/Error Header/iu);
    expect(errorElement).toBeInTheDocument();
  });

  it('displays error notifications with content from memory', () => {
    // ARRANGE
    const initializeState = ({ set }: { set: SetRecoilState }) => {
      set(notificationsState, [{
        header: 'Error Header',
        content: 'Error Content',
        dismissible: true,
        type: 'error',
        id: 'test',
      }]);
    };

    // ACT
    render(<RecoilRoot initializeState={initializeState}><Notifications/></RecoilRoot>);

    // ASSERT
    let errorElement: HTMLElement | undefined = undefined;
    errorElement = screen.getByText(/Error Content/iu);
    expect(errorElement).toBeInTheDocument();
  });
});