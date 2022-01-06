// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { Routes, Route, Navigate } from 'react-router-dom';
import { Sample } from '../components/pages';

const routerAuth = (): JSX.Element => {
  return (
    <Routes>
      <Route path="/sample" element={<Sample />} />
      <Route path="/" element={<Navigate replace to="/sample" />} />
    </Routes>
  );
};

export { routerAuth as RouterAuth };
