// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
export default class DataProvider {
  getData(name: string): Promise<any[]> {
    return fetch(`../resources/${name}-mock.json`).then(response => {
      if (!response.ok) { throw new Error(`Response error: ${response.status}`); }

      return response.json();
    });
  }
}
