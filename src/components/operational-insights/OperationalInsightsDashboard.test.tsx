/**
 * © Copyright IBM Corp. 2026
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, act } from '@testing-library/react';

jest.mock('@carbon/charts-react', () => ({
  LineChart: (props: any) => <div data-testid="mock-line-chart">{props.options?.title}</div>,
  GroupedBarChart: (props: any) => (
    <div data-testid="mock-grouped-bar-chart">{JSON.stringify(props.data)}</div>
  ),
  DonutChart: (props: any) => <div data-testid="mock-donut-chart">{props.options?.title}</div>,
  PieChart: (props: any) => <div data-testid="mock-pie-chart">{props.options?.title}</div>,
  SimpleBarChart: (props: any) => <div data-testid="mock-bar-chart">{props.options?.title}</div>,
}));
import OperationalInsightsDashboard from './OperationalInsightsDashboard';
import KpiMetricsBanner from './components/KpiMetricsBanner';
import OpenIncidentAge from './components/OpenIncidentAge';
import CompressionTimeline from './components/CompressionTimeline';
import TopNoiseContributors from './components/TopNoiseContributors';
import TopIncidents from './components/TopIncidents';
import CorrelationBreakdown from './components/CorrelationBreakdown';
import AlertHandling from './components/AlertHandling';

describe('OperationalInsightsDashboard Components', () => {
  const mockCompression = {
    rawEventCount: 150000,
    alertCount: 2500,
    incidentCount: 50,
    groupedAlertCount: 2500,
    ungroupedAlertCount: 0,
    actionableCount: 50,
    deduplicationRatio: 98.3,
    groupingRatio: 98.0,
    overallReductionRatio: 99.9
  };

  const mockOpenAge = {
    openCount: 15,
    unassignedCount: 4,
    oldestMinutes: 1500,
    oldestFormatted: '1d 1h',
    avgAgeMinutes: 45,
    avgAgeFormatted: '45m',
    countByPriority: { 1: 2, 2: 3, 3: 5, 4: 3, 5: 2 },
    avgAgeByPriority: { 1: 15, 2: 30, 3: 45, 4: 90, 5: 120 },
    avgAgeByPriorityFormatted: { 1: '15m', 2: '30m', 3: '45m', 4: '1h 30m', 5: '2h' }
  };

  const mockTopResources = [
    {
      resource: 'k8s-worker-node-01.prod',
      alertCount: 120,
      eventCount: 4500,
      maxSeverity: 'Critical'
    },
    {
      resource: 'payment-gateway-service',
      alertCount: 85,
      eventCount: 2100,
      maxSeverity: 'Major'
    }
  ];

  it('renders KpiMetricsBanner with formatted values', () => {
    render(<KpiMetricsBanner compression={mockCompression} />);
    expect(screen.getByText('Events')).toBeInTheDocument();
    expect(screen.getByText('150.0K')).toBeInTheDocument();
    expect(screen.getByText('Alerts')).toBeInTheDocument();
    expect(screen.getByText('2.5K')).toBeInTheDocument();
    expect(screen.getByText('Incidents')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('Events → Alerts')).toBeInTheDocument();
    expect(screen.getByText('98.3%')).toBeInTheDocument();
    expect(screen.getByText('Alerts → Incidents')).toBeInTheDocument();
    expect(screen.getByText('98.0%')).toBeInTheDocument();
  });

  it('renders OpenIncidentAge with open stats and priority breakdown', () => {
    render(<OpenIncidentAge openAge={mockOpenAge} />);
    expect(screen.getByText('Open Incident Age')).toBeInTheDocument();
    expect(screen.getAllByText('45m').length).toBeGreaterThan(0);
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('Unassigned')).toBeInTheDocument();
    expect(screen.getByText('1d 1h')).toBeInTheDocument();
    expect(screen.getAllByText('P1 - Critical').length).toBeGreaterThan(0);
    expect(screen.getByText('2 / 15m')).toBeInTheDocument();
  });

  it('renders CompressionTimeline for new alerts and incidents', () => {
    render(
      <CompressionTimeline
        timelineData={[
          { group: 'Alerts', date: '2026-01-01T10:00:00.000Z', value: 5 },
          { group: 'Incidents', date: '2026-01-01T10:00:00.000Z', value: 1 }
        ]}
      />
    );
    expect(screen.getByText('New Alerts & Incidents')).toBeInTheDocument();
    // A single grouped bar chart holds both series on one shared scale
    const chart = screen.getByTestId('mock-grouped-bar-chart');
    expect(chart).toHaveTextContent('"group":"Alerts"');
    expect(chart).toHaveTextContent('"group":"Incidents"');
  });

  it('renders TopNoiseContributors correctly', () => {
    render(<TopNoiseContributors topResources={mockTopResources} />);
    expect(screen.getByText('Top noise resources')).toBeInTheDocument();
    expect(screen.getByText('k8s-worker-node-01.prod')).toBeInTheDocument();
    expect(screen.getByText('payment-gateway-service')).toBeInTheDocument();
  });

  it('renders TopIncidents with priority and alert counts', () => {
    render(
      <TopIncidents
        topIncidents={[
          { id: 'i1', title: 'Payments down', priority: 1, state: 'inProgress', alertCount: 12 },
          { id: 'i2', title: 'Slow search', priority: 3, state: 'unassigned', alertCount: 1 }
        ]}
      />
    );
    expect(screen.getByText('Biggest incidents by priority, alert count')).toBeInTheDocument();
    expect(screen.getByText('Payments down')).toBeInTheDocument();
    expect(screen.getByText('12 alerts')).toBeInTheDocument();
    expect(screen.getByText('1 alert')).toBeInTheDocument();
  });

  it('renders CorrelationBreakdown groups and alerts per mechanism', () => {
    render(
      <CorrelationBreakdown
        correlationBreakdown={[
          { key: 'temporal', label: 'Temporal', groupCount: 2, alertCount: 7 },
          { key: 'topological', label: 'Topological', groupCount: 0, alertCount: 0 },
          { key: 'scope', label: 'Scope-based', groupCount: 1, alertCount: 3 }
        ]}
      />
    );
    expect(screen.getByText('Temporal')).toBeInTheDocument();
    expect(screen.getByText(/2 groups/)).toBeInTheDocument();
    expect(screen.getByText(/1 group ·/)).toBeInTheDocument();
  });

  it('renders AlertHandling counts and percentages', () => {
    render(
      <AlertHandling
        stats={[
          { key: 'acknowledged', label: 'Alerts acknowledged', count: 5, percent: 12.5 },
          { key: 'assigned', label: 'Alerts assigned', count: 10, percent: 25 },
          { key: 'grouped', label: 'Alerts grouped', count: 40, percent: 100 }
        ]}
      />
    );
    expect(screen.getByText('Alerts acknowledged')).toBeInTheDocument();
    expect(screen.getByText('12.5%')).toBeInTheDocument();
    expect(screen.getByText('Alerts assigned')).toBeInTheDocument();
    expect(screen.getByText('25%')).toBeInTheDocument();
    expect(screen.getByText('Alerts grouped')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('renders full OperationalInsightsDashboard layout', async () => {
    await act(async () => {
      render(<OperationalInsightsDashboard />);
    });
    expect(screen.getByText('Operational Insights')).toBeInTheDocument();
    expect(screen.getByText('Event deduplication, alarm grouping efficiency, and resolution analytics')).toBeInTheDocument();
  });
});
