// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { render, screen, waitFor } from '@testing-library/react';
import { Breadcrumb, BreadcrumbItem } from './breadcrumb';
import { act } from 'react-dom/test-utils';

describe('Render Foo item', () => {
  const items : BreadcrumbItem[] = [ { path: 'foo', href: '/' } ];

  it('displays foo in the breadcrumb', async () => {

    // ACT
    act(() => {
      render(<Breadcrumb items={items} />);
    });

    // ASSERT
    let fooText: HTMLElement | undefined = undefined;
    await waitFor(() => {
      fooText = screen.getByText(/foo/iu);
    });

    expect(fooText).toBeInTheDocument();
  });
});
