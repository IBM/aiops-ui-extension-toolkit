/**
 * © Copyright IBM Corp. 2026
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Dropdown, Button, InlineLoading, InlineNotification } from '@carbon/react';
import { Renew } from '@carbon/icons-react';
import { INSIGHTS_TIMEFRAMES } from '../constants';
import { useInsightsData, InsightsTimeframeOption } from '../../helpers/useInsightsData';
import KpiMetricsBanner from './components/KpiMetricsBanner';
import OpenIncidentAge from './components/OpenIncidentAge';
import CompressionTimeline from './components/CompressionTimeline';
import TopNoiseContributors from './components/TopNoiseContributors';
import TopIncidents from './components/TopIncidents';
import CorrelationBreakdown from './components/CorrelationBreakdown';
import AlertHandling from './components/AlertHandling';

import '@carbon/charts-react/styles.css';
import './OperationalInsightsDashboard.scss';

export interface OperationalInsightsDashboardProps {
  initialTimeframe?: string;
  [key: string]: any;
}

export const OperationalInsightsDashboard: React.FC<OperationalInsightsDashboardProps> = ({
  initialTimeframe = '24h'
}) => {
  const {
    timeframe,
    setTimeframe,
    loading,
    error,
    refetch,
    compression,
    openAge,
    timelineData,
    topResources,
    topIncidents,
    correlationBreakdown,
    alertHandling
  } = useInsightsData(initialTimeframe);

  const handleTimeframeChange = (e: { selectedItem: InsightsTimeframeOption | null }) => {
    if (e.selectedItem) {
      setTimeframe(e.selectedItem);
    }
  };

  return (
    <div className="operational-insights-dashboard">
      {/* Top Header Bar */}
      <div className="insights-header-bar">
        <div className="insights-header-text">
          <h2 className="insights-header-title">Operational Insights</h2>
          <p className="insights-header-description">
            Event deduplication, alarm grouping efficiency, and resolution analytics
          </p>
        </div>

        <div className="insights-header-actions">
          {loading && <InlineLoading status="active" description="Refreshing telemetry..." />}

          <Dropdown
            id="insights-timeframe-dropdown"
            className="insights-timeframe-select"
            label="Select timeframe"
            titleText=""
            hideLabel
            items={INSIGHTS_TIMEFRAMES}
            itemToString={(item: InsightsTimeframeOption) => (item ? item.label : '')}
            selectedItem={timeframe}
            onChange={handleTimeframeChange}
            size="md"
          />

          <Button
            kind="ghost"
            hasIconOnly
            renderIcon={Renew}
            iconDescription="Refresh Insights Data"
            onClick={refetch}
            size="md"
          />
        </div>
      </div>

      {error && (
        <InlineNotification
          kind="error"
          title="Error loading insights telemetry"
          subtitle={typeof error === 'string' ? error : 'Failed to query operational data layer.'}
          lowContrast
          className="insights-error-banner"
        />
      )}

      {/* KPI Metric Banners & Alert Handling */}
      <div className="insights-summary-row">
        <KpiMetricsBanner compression={compression} />
        <AlertHandling stats={alertHandling} />
      </div>

      {/* Main Grid Content */}
      <div className="insights-dashboard-grid">
        {/* Row 1: Open incident age & Top Noise Resources */}
        <div className="insights-grid-row">
          <div className="insights-grid-col insights-grid-col--half">
            <OpenIncidentAge openAge={openAge} />
          </div>
          <div className="insights-grid-col insights-grid-col--half">
            <TopNoiseContributors topResources={topResources} />
          </div>
        </div>

        {/* Row 2: New Alerts & Incidents */}
        <div className="insights-grid-row insights-grid-row--chart">
          <div className="insights-grid-col insights-grid-col--full">
            <CompressionTimeline timelineData={timelineData} />
          </div>
        </div>

        {/* Row 3: Biggest Incidents & Correlations */}
        <div className="insights-grid-row">
          <div className="insights-grid-col insights-grid-col--half">
            <TopIncidents topIncidents={topIncidents} />
          </div>
          <div className="insights-grid-col insights-grid-col--half">
            <CorrelationBreakdown correlationBreakdown={correlationBreakdown} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperationalInsightsDashboard;
