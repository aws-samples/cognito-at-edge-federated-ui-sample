// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { AppLayout, Box, Flashbar, FlashbarProps, Grid, SideNavigationProps } from '@awsui/components-react';
import './home.scss';
import Navigation from '../../layout/navigation/navigation';
import { FC } from 'react';
import { useRecoilValue } from 'recoil';
import { loggedUser } from '../../../state';

/* eslint @typescript-eslint/no-magic-numbers: "off" */

const i18n = {
  awaitLogin: 'Please wait while we log you in...',
};

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface HomeProps {
}

const homePage: FC<HomeProps> = () => {
  const loggedInUser = useRecoilValue(loggedUser);

  return (
    <AppLayout
      content={renderContent()}
      navigation={<Navigation user={loggedInUser} navigationItems={getItems()}/>}
      navigationOpen={false}
      toolsHide={true}
      notifications={renderAuthPendingNotification()}
    />
  );

  function renderAuthPendingNotification() {
    const authPendingNotification: FlashbarProps.MessageDefinition[] = [{
      type: 'success',
      loading: true,
      content: i18n.awaitLogin,
    }];

    return <Flashbar items={authPendingNotification}/>;
  }

  function renderContent() {
    return (
      <>
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
                                        Welcome to Sample Application
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
      </>
    );
  }

  function getItems(): SideNavigationProps.Item[] {
    return [{
      type: 'section',
      text: 'Home',
      items: []
    }
    ];
  }

};

export { homePage as HomePage };
