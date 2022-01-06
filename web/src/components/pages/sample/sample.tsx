// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { AppLayout, Box, Grid, HelpPanel } from '@awsui/components-react';
import './sample.scss';
import { FC } from 'react';
import Navigation from '../../layout/navigation/navigation';
import { Breadcrumb, BreadcrumbItem } from '../../layout/breadcrumb/breadcrumb';
import { SideNavigationProps } from '@awsui/components-react/side-navigation';
import { useRecoilValue } from 'recoil';
import { loggedUser } from '../../../state';
import { Notifications } from '../../layout/notifications/notifications';

/* eslint @typescript-eslint/no-magic-numbers: "off" */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface SampleProps {
}

const sample: FC<SampleProps> = () => {
  const loggedInUser = useRecoilValue(loggedUser);

  function getItems(): SideNavigationProps.Item[] {
    return [
      {
        type: 'section',
        text: 'Home',
        items: [
          { type: 'link', text: 'Sample', href: '/sample' },
        ],
      },
    ];
  }

  function getBreadcrumbItems(): BreadcrumbItem[] {
    return [
      { path: 'Home', href: '/' },
      { path: 'Sample', href: '/sample' },
    ];
  }

  return (
    <>
      <AppLayout
        navigation={
          <Navigation user={loggedInUser} navigationItems={getItems()} />
        }
        breadcrumbs={renderBreadcrumb()}
        content={renderContent()}
        contentType="cards"
        tools={renderTools()}
        notifications={<Notifications />}
      />
    </>
  );

  function renderContent() {
    return <>
      <Box margin={{ bottom: 'l' }}>
        <div className="custom-home__header">
          <Box padding={{ vertical: 'xxl', horizontal: 's' }}>
            <Grid
              gridDefinition={[
                { offset: { l: 2, xxs: 1 }, colspan: { l: 8, xxs: 10 } },
                { colspan: { xl: 6, l: 5, s: 6, xxs: 10 }, offset: { l: 2, xxs: 1 } },
                { colspan: { xl: 2, l: 3, s: 4, xxs: 10 }, offset: { s: 0, xxs: 1 } }
              ]}
            >
              <div className="custom-home__header-title">
                <Box variant="h1" fontWeight="bold" padding="n" fontSize="display-l"
                  color="inherit">
                  Sample Application
                </Box>
                <Box fontWeight="light" padding={{ bottom: 's' }} fontSize="display-l"
                  color="inherit">
                  Welcome to Sample Application Protected Page
                </Box>
                <Box variant="p" fontWeight="light">
                  <span className="custom-home__header-sub-title">
                      Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu f
                      ugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident,
                      sunt in culpa qui officia deserunt mollit anim id est laborum.
                  </span>
                </Box>
              </div>
            </Grid>
          </Box>
        </div>
      </Box>
    </>;
  }

  function renderBreadcrumb() {
    return <Breadcrumb items={getBreadcrumbItems()} />;
  }

  function renderTools() {
    return (
      <HelpPanel
        header={<h2>Sample protected resource</h2>}
        footer={
          <div>
            <h3>
              Sample footer
            </h3>
          </div>
        }
      >
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat.
        </p>
      </HelpPanel>
    );
  }
};

export { sample as Sample };
