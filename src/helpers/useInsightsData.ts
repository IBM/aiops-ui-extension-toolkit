/**
 * © Copyright IBM Corp. 2026
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo, useState } from 'react';
import { useQuery } from './useQuery';
import { ALERT_QUERY_PARAMS, INCIDENT_QUERY_PARAMS, INSIGHTS_TIMEFRAMES, SEVERITIES } from '../components/constants';
import { getOpenIncidentAge, OpenIncidentAgeResult } from './getOpenIncidentAge';
import { getCompressionMetrics, CompressionMetricsResult } from './getCompressionMetrics';
import { getCorrelationBreakdown, CorrelationBreakdownItem } from './getCorrelationBreakdown';
import { getAlertHandlingStats, AlertHandlingStat } from './getAlertHandlingStats';

function getAlertFieldValue(row: Record<string, any>, colName: string): any {
  if (row.fields && Array.isArray(row.fields)) {
    const idx = ALERT_QUERY_PARAMS.columns.indexOf(colName);
    return idx >= 0 ? row.fields[idx] : undefined;
  }
  return row[colName];
}

export interface InsightsTimeframeOption {
  label: string;
  value: string;
  hours: number;
}

export interface ResourceNoiseItem {
  resource: string;
  alertCount: number;
  eventCount: number;
  maxSeverity: string;
}

export interface TopIncidentItem {
  id: string;
  title: string;
  priority: number;
  state: string;
  alertCount: number;
}

export interface TimeSeriesPoint {
  group: string;
  date: string;
  value: number;
}

export interface UseInsightsDataReturn {
  timeframe: InsightsTimeframeOption;
  setTimeframe: (tf: InsightsTimeframeOption) => void;
  loading: boolean;
  error?: any;
  refetch: () => void;
  compression: CompressionMetricsResult;
  openAge: OpenIncidentAgeResult;
  timelineData: TimeSeriesPoint[];
  topResources: ResourceNoiseItem[];
  topIncidents: TopIncidentItem[];
  correlationBreakdown: CorrelationBreakdownItem[];
  alertHandling: AlertHandlingStat[];
}

export function useInsightsData(initialTimeframeValue = '24h'): UseInsightsDataReturn {
  const [selectedTimeframe, setSelectedTimeframe] = useState<InsightsTimeframeOption>(
    () => INSIGHTS_TIMEFRAMES.find((tf) => tf.value === initialTimeframeValue) || INSIGHTS_TIMEFRAMES[1]
  );

  const cutoffTime = useMemo(() => {
    return new Date(Date.now() - selectedTimeframe.hours * 60 * 60 * 1000);
  }, [selectedTimeframe]);

  const alertQueryParams = useMemo(() => {
    const timeFilter = `firstOccurrenceTime > '${cutoffTime.toISOString()}'`;
    return {
      ...ALERT_QUERY_PARAMS,
      filter: ALERT_QUERY_PARAMS.filter ? `(${ALERT_QUERY_PARAMS.filter}) and (${timeFilter})` : timeFilter
    };
  }, [cutoffTime]);

  const incidentQueryParams = useMemo(() => {
    return {
      ...INCIDENT_QUERY_PARAMS,
      filter: `createdTime > '${cutoffTime.toISOString()}'`
    };
  }, [cutoffTime]);

  const alertsQuery = useQuery<any>('getAlerts', alertQueryParams);
  const incidentsQuery = useQuery<any>('getStories', incidentQueryParams);

  const loading = Boolean(alertsQuery.loading || incidentsQuery.loading);
  const error = alertsQuery.error || incidentsQuery.error;

  const refetch = () => {
    alertsQuery.refetch();
    incidentsQuery.refetch();
  };

  const alertRows: Array<Record<string, any>> = useMemo(() => {
    const raw = alertsQuery.data?.tenant?.alerts?.rows || alertsQuery.data?.tenant?.alerts || [];
    return Array.isArray(raw) ? raw : [];
  }, [alertsQuery.data]);

  const incidentRows: Array<Record<string, any>> = useMemo(() => {
    const raw = incidentsQuery.data?.tenant?.stories?.rows || incidentsQuery.data?.tenant?.stories || [];
    return Array.isArray(raw) ? raw : [];
  }, [incidentsQuery.data]);

  const compression = useMemo(() => {
    return getCompressionMetrics({ alerts: alertRows, incidents: incidentRows });
  }, [alertRows, incidentRows]);

  const openAge = useMemo(() => {
    return getOpenIncidentAge(incidentRows);
  }, [incidentRows]);

  // Compute Timeline Data (Bucketed Alerts vs Incidents)
  const timelineData = useMemo(() => {
    const numBuckets = selectedTimeframe.hours <= 1 ? 6 : selectedTimeframe.hours <= 24 ? 12 : 14;
    const bucketIntervalMs = (selectedTimeframe.hours * 60 * 60 * 1000) / numBuckets;
    const startTimeMs = cutoffTime.getTime();

    const alertBuckets = new Array(numBuckets).fill(0);
    const incidentBuckets = new Array(numBuckets).fill(0);

    alertRows.forEach((row) => {
      const rawTime = getAlertFieldValue(row, 'firstOccurrenceTime') || row.firstOccurrenceTime;
      const t = rawTime ? new Date(rawTime).getTime() : NaN;
      if (!isNaN(t) && t >= startTimeMs) {
        const bucketIdx = Math.min(numBuckets - 1, Math.max(0, Math.floor((t - startTimeMs) / bucketIntervalMs)));
        alertBuckets[bucketIdx] += 1;
      }
    });

    incidentRows.forEach((row) => {
      const t = row.createdTime ? new Date(row.createdTime).getTime() : NaN;
      if (!isNaN(t) && t >= startTimeMs) {
        const bucketIdx = Math.min(numBuckets - 1, Math.max(0, Math.floor((t - startTimeMs) / bucketIntervalMs)));
        incidentBuckets[bucketIdx] += 1;
      }
    });

    const series: TimeSeriesPoint[] = [];
    for (let i = 0; i < numBuckets; i++) {
      const dateStr = new Date(startTimeMs + (i + 0.5) * bucketIntervalMs).toISOString();
      series.push({
        group: 'Alerts',
        date: dateStr,
        value: alertBuckets[i]
      });
      series.push({
        group: 'Incidents',
        date: dateStr,
        value: incidentBuckets[i]
      });
    }

    return series;
  }, [alertRows, incidentRows, cutoffTime, selectedTimeframe]);

  // Compute Top Noise Contributing Resources
  const topResources = useMemo(() => {
    const resourceMap: Record<string, { alertCount: number; eventCount: number; maxSeverity: string }> = {};

    alertRows.forEach((row) => {
      const resName =
        getAlertFieldValue(row, 'resource.name') ||
        row['resource.name'] ||
        row.resource?.name ||
        row.resource ||
        'Unknown Resource';

      const eventCount = Math.max(
        1,
        Number(getAlertFieldValue(row, 'eventCount') ?? getAlertFieldValue(row, 'occurrenceCount') ?? row.eventCount ?? row.occurrenceCount ?? 1) || 1
      );

      const rawSeverity = getAlertFieldValue(row, 'severity') ?? row.severity;
      let severityName = 'Information';
      if (typeof rawSeverity === 'number' || (!isNaN(Number(rawSeverity)) && rawSeverity !== null && rawSeverity !== '')) {
        const sevIndex = Number(rawSeverity);
        severityName = SEVERITIES[sevIndex] || `Severity ${sevIndex}`;
      } else if (rawSeverity) {
        severityName = String(rawSeverity);
      }

      if (!resourceMap[resName]) {
        resourceMap[resName] = { alertCount: 0, eventCount: 0, maxSeverity: severityName };
      }
      resourceMap[resName].alertCount += 1;
      resourceMap[resName].eventCount += eventCount;
      resourceMap[resName].maxSeverity = severityName;
    });

    return Object.entries(resourceMap)
      .map(([resource, stats]) => ({
        resource,
        alertCount: stats.alertCount,
        eventCount: stats.eventCount,
        maxSeverity: stats.maxSeverity
      }))
      .sort((a, b) => b.eventCount - a.eventCount)
      .slice(0, 10);
  }, [alertRows]);

  // Top 10 incidents sorted by priority (P1 first) and then by number of alerts
  const topIncidents = useMemo(() => {
    return incidentRows
      .map((row) => ({
        id: String(row.id),
        title: row.title || row.description || String(row.id),
        priority: Number(row.priority) || 3,
        state: String(row.state || ''),
        alertCount: Array.isArray(row.alertIds) ? row.alertIds.length : 0
      }))
      .sort((x, y) => x.priority - y.priority || y.alertCount - x.alertCount)
      .slice(0, 10);
  }, [incidentRows]);

  // Valid correlation groups per mechanism (a correlation id must be shared by 2+ alerts)
  const correlationBreakdown = useMemo(() => {
    return getCorrelationBreakdown(alertRows, getAlertFieldValue);
  }, [alertRows]);

  // Acknowledged / assigned / grouped alert shares
  const alertHandling = useMemo(() => {
    return getAlertHandlingStats(alertRows, getAlertFieldValue, compression.groupedAlertCount);
  }, [alertRows, compression.groupedAlertCount]);

  return {
    timeframe: selectedTimeframe,
    setTimeframe: setSelectedTimeframe,
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
  };
}
