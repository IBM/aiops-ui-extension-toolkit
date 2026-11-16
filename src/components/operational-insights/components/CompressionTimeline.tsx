/**
 * © Copyright IBM Corp. 2026
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { Tile } from '@carbon/react';
// @ts-ignore
import { GroupedBarChart } from '@carbon/charts-react';
import { TimeSeriesPoint } from '../../../helpers/useInsightsData';

export interface CompressionTimelineProps {
  timelineData: TimeSeriesPoint[];
}

const DAY_MS = 24 * 60 * 60 * 1000;

// Counts are whole numbers, so hide fractional ticks (e.g. 0.5 incidents)
const integerTicks = {
  formatter: (value: number | string) => (Number.isInteger(Number(value)) ? String(value) : '')
};

const chartOptions = {
  // No chart title/toolbar: the tile header already names the chart, and the toolbar row
  // would eat into the (shared) available height.
  toolbar: { enabled: false },
  axes: {
    // Each time interval is a labelled group holding an "Alerts" and an "Incidents" bar
    bottom: {
      mapsTo: 'key',
      scaleType: 'labels'
    },
    // One shared scale for both series
    left: {
      mapsTo: 'value',
      title: 'Count',
      scaleType: 'linear',
      ticks: integerTicks
    }
  },
  bars: { maxWidth: 28 },
  color: {
    scale: {
      Alerts: '#8a3ffc',
      Incidents: '#da1e28'
    }
  },
  height: '100%',
  legend: {
    alignment: 'center'
  }
};

export const CompressionTimeline: React.FC<CompressionTimelineProps> = ({ timelineData }) => {
  const chartData = useMemo(() => {
    const times = timelineData.map((d) => new Date(d.date).getTime());
    const spansMultipleDays = times.length > 0 && Math.max(...times) - Math.min(...times) > DAY_MS * 1.1;

    // Label each interval by its midpoint: time only for <= ~1 day, otherwise date + time
    const formatLabel = (iso: string): string => {
      const date = new Date(iso);
      return spansMultipleDays
        ? date.toLocaleString([], { day: 'numeric', hour: 'numeric', month: 'short' })
        : date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    };

    return timelineData.map((d) => ({
      group: d.group,
      key: formatLabel(d.date),
      value: d.value
    }));
  }, [timelineData]);

  return (
    <Tile className="insights-panel-tile insights-timeline-tile">
      <div className="insights-panel-header">
        <h4 className="insights-panel-title">New Alerts & Incidents</h4>
        <span className="insights-panel-subtitle">
          Alerts and incidents first raised in each time interval
        </span>
      </div>

      <div className="insights-chart-container">
        {chartData.length > 0 ? (
          <GroupedBarChart data={chartData} options={chartOptions as any} />
        ) : (
          <div className="insights-empty-chart">No alerts or incidents recorded in this time window.</div>
        )}
      </div>
    </Tile>
  );
};

export default CompressionTimeline;
