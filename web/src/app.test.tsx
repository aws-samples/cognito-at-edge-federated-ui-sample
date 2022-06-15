// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { render, screen, waitFor } from '@testing-library/react';
import App from './app';
import { RecoilRoot } from 'recoil';
import { BrowserRouter } from 'react-router-dom';
import { act } from 'react-dom/test-utils';

describe('Unauthenticated Home Screen', () => {
  it('displays Welcome to Sample Application text', async () => {

    // ACT
    act(() => {
      render(<BrowserRouter><RecoilRoot><App/></RecoilRoot></BrowserRouter>);
    });

    // ASSERT

    let welcomeElement: HTMLElement | undefined = undefined;
    await waitFor(() => {
      welcomeElement = screen.getByText(/Welcome to Sample Application/iu);
    });

    expect(welcomeElement).toBeInTheDocument();
  });
});
