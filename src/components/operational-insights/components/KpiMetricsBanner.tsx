/**
 * © Copyright IBM Corp. 2026
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Tile } from '@carbon/react';
import { CompressionMetricsResult } from '../../../helpers/getCompressionMetrics';

export interface KpiMetricsBannerProps {
  compression: CompressionMetricsResult;
}

export const KpiMetricsBanner: React.FC<KpiMetricsBannerProps> = ({ compression }) => {
  const { rawEventCount, alertCount, incidentCount, deduplicationRatio, groupingRatio } = compression;

  const formatNumber = (num: number): string => {
    if (num >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(1)}M`;
    }
    if (num >= 1_000) {
      return `${(num / 1_000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  return (
    <div className="insights-kpi-banner">
      <Tile className="insights-kpi-card">
        <div className="insights-kpi-label">Events</div>
        <div className="insights-kpi-value">{formatNumber(rawEventCount)}</div>
      </Tile>

      <Tile className="insights-kpi-card">
        <div className="insights-kpi-label">Alerts</div>
        <div className="insights-kpi-value">{formatNumber(alertCount)}</div>
      </Tile>

      <Tile className="insights-kpi-card">
        <div className="insights-kpi-label">Incidents</div>
        <div className="insights-kpi-value">{formatNumber(incidentCount)}</div>
      </Tile>

      <Tile className="insights-kpi-card insights-kpi-card--highlight">
        <div className="insights-kpi-label">Events → Alerts</div>
        <div className="insights-kpi-value insights-kpi-value--highlight">
          {deduplicationRatio.toFixed(1)}%
        </div>
      </Tile>

      <Tile className="insights-kpi-card insights-kpi-card--highlight">
        <div className="insights-kpi-label">Alerts → Incidents</div>
        <div className="insights-kpi-value insights-kpi-value--highlight">
          {groupingRatio.toFixed(1)}%
        </div>
      </Tile>
    </div>
  );
};

export default KpiMetricsBanner;
