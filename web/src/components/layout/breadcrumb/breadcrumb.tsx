// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { FC } from 'react';
import { BreadcrumbGroup, BreadcrumbGroupProps } from '@awsui/components-react';

import './breadcrumb.scss';

/* eslint @typescript-eslint/no-empty-interface: "off", no-empty-pattern: "off" */

/* eslint @typescript-eslint/no-empty-interface: "off", no-empty-pattern: "off" */

export interface BreadcrumbItem {
  path: string,
  href: string,
}

interface Props {
  items: BreadcrumbItem[],
}

const breadcrumb: FC<Props> = ({
  items
}) => {

  function buildItems() : BreadcrumbGroupProps.Item[] {
    return items.map((i) => { return { text: i.path, href: i.href }; });
  }

  return (
    <BreadcrumbGroup
      items={buildItems()}
    />
  );
};

export { breadcrumb as Breadcrumb };
