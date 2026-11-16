/**
 * © Copyright IBM Corp. 2026
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import OperationalInsightsDashboard from './OperationalInsightsDashboard';

export default {
  title: 'Operational Insights Dashboard',
  component: OperationalInsightsDashboard,
  parameters: {
    layout: 'fullscreen'
  }
};

export const Default24Hours = () => {
  return <OperationalInsightsDashboard initialTimeframe="24h" />;
};

export const Last7Days = () => {
  return <OperationalInsightsDashboard initialTimeframe="7d" />;
};

export const Last90Days = () => {
  return <OperationalInsightsDashboard initialTimeframe="90d" />;
};
