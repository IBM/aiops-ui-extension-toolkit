/**
 * © Copyright IBM Corp. 2026
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import createPanel from '../app/createPanel';
import CleanConsole from '../components/CleanConsole';

const CleanConsolePanel = () => {
  return React.createElement(CleanConsole, {});
};

export default createPanel(CleanConsolePanel);
