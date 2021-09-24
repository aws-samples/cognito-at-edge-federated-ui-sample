// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { API } from 'aws-amplify';

interface MyAppAPIResponse {
  id: string,
}

export const myAppAPI = {
  resourcePath: async (): Promise<MyAppAPIResponse> => {
    const subscriptionResponse: MyAppAPIResponse =
      await API.post('MyAppAPI', 'ResourcePath', {
        body: {
        }
      });
    return subscriptionResponse;
  },
};
