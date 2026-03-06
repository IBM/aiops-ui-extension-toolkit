/**
 * © Copyright IBM Corp. 2022, 2025
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export type PanelProps = {
  dashOriginUrl?: string,
  isZenHeaderEnabled?: boolean,
  akoraOriginUrl?: string,
  asmProxyEndpoint?: string,
  app?: unknown,
  locale?: string,
  [key: string]: any // Allow any additional props
};

const createPanel = <P extends object>(Component: React.ComponentType<P>) =>
  (props: PanelProps & P): JSX.Element => <Component {...props as P} />;

export default createPanel;