/**
 * © Copyright IBM Corp. 2026
 * SPDX-License-Identifier: Apache-2.0
 */

import { ALERT_QUERY_PARAMS } from '../components/constants';

export interface CompressionMetricsInput {
  alerts?: Array<Record<string, any>> | { rows?: Array<Record<string, any>>; columns?: Array<any> };
  incidents?: Array<Record<string, any>> | { rows?: Array<Record<string, any>> };
  rawEventOverride?: number;
}

export interface CompressionMetricsResult {
  rawEventCount: number;
  alertCount: number;
  incidentCount: number;
  groupedAlertCount: number;
  ungroupedAlertCount: number;
  actionableCount: number;
  deduplicationRatio: number;
  groupingRatio: number;
  overallReductionRatio: number;
}

export function getCompressionMetrics(input: CompressionMetricsInput = {}): CompressionMetricsResult {
  const alertRows: Array<Record<string, any>> = Array.isArray(input.alerts)
    ? input.alerts
    : (input.alerts && Array.isArray((input.alerts as any).rows) ? (input.alerts as any).rows : []);

  const incidentRows: Array<Record<string, any>> = Array.isArray(input.incidents)
    ? input.incidents
    : (input.incidents && Array.isArray((input.incidents as any).rows) ? (input.incidents as any).rows : []);

  const alertCount = alertRows.length;
  const incidentCount = incidentRows.length;

  const eventCountColIdx = ALERT_QUERY_PARAMS?.columns ? ALERT_QUERY_PARAMS.columns.indexOf('eventCount') : -1;

  let calculatedRawEvents = 0;
  alertRows.forEach((row) => {
    let countVal: any = row.eventCount ?? row.occurrenceCount;
    if (countVal === undefined && row.fields && Array.isArray(row.fields) && eventCountColIdx >= 0) {
      // Akora format: the count of events that contributed to this (deduplicated) alert
      countVal = row.fields[eventCountColIdx];
    }
    const eventCount = Number(countVal ?? 1);
    calculatedRawEvents += isNaN(eventCount) || eventCount < 1 ? 1 : eventCount;
  });

  const rawEventCount = input.rawEventOverride !== undefined && input.rawEventOverride >= alertCount
    ? input.rawEventOverride
    : Math.max(calculatedRawEvents, alertCount);

  // Identify which alerts are actually linked/grouped into incidents
  const groupedAlertIds = new Set<string>();
  incidentRows.forEach((inc) => {
    if (Array.isArray(inc.alertIds)) {
      inc.alertIds.forEach((id: string) => groupedAlertIds.add(id));
    }
  });

  let groupedAlertCount = 0;
  const alertIdColIdx = ALERT_QUERY_PARAMS?.columns ? ALERT_QUERY_PARAMS.columns.indexOf('id') : -1;
  const relatedStoriesColIdx = ALERT_QUERY_PARAMS?.columns ? ALERT_QUERY_PARAMS.columns.indexOf('relatedStoryIds') : -1;

  alertRows.forEach((row) => {
    const alertId = row.id || (row.fields && Array.isArray(row.fields) && alertIdColIdx >= 0 ? row.fields[alertIdColIdx] : undefined);
    if (alertId && groupedAlertIds.has(alertId)) {
      groupedAlertCount++;
    } else {
      let hasStory = false;
      if (Array.isArray(row.relatedStoryIds) && row.relatedStoryIds.length > 0) hasStory = true;
      if (row.fields && Array.isArray(row.fields) && relatedStoriesColIdx >= 0) {
        try {
          const rawStoryIds = row.fields[relatedStoriesColIdx];
          if (rawStoryIds && JSON.parse(rawStoryIds).length > 0) hasStory = true;
        } catch {
          // ignore
        }
      }
      if (hasStory) groupedAlertCount++;
    }
  });

  if (groupedAlertCount === 0 && groupedAlertIds.size > 0) {
    groupedAlertCount = Math.min(groupedAlertIds.size, alertCount);
  } else if (groupedAlertCount === 0 && incidentCount > 0 && groupedAlertIds.size === 0) {
    groupedAlertCount = alertCount;
  }

  const ungroupedAlertCount = Math.max(0, alertCount - groupedAlertCount);
  const actionableCount = incidentCount + ungroupedAlertCount;

  // Deduplication ratio: (1 - (alerts / rawEvents)) * 100
  const deduplicationRatio = rawEventCount > 0 && alertCount > 0
    ? Math.max(0, Math.min(100, Math.round((1 - alertCount / rawEventCount) * 1000) / 10))
    : 0;

  // Incident creation / grouping ratio: (1 - (incidents / groupedAlerts)) * 100
  const groupingRatio = groupedAlertCount > 0 && incidentCount > 0
    ? Math.max(0, Math.min(100, Math.round((1 - incidentCount / groupedAlertCount) * 1000) / 10))
    : 0;

  // Overall reduction ratio:
  // Evaluates actual actionable triage count (incidents + ungrouped alerts) vs raw events
  let overallReductionRatio = 0;
  if (rawEventCount > 0) {
    if (actionableCount > 0) {
      overallReductionRatio = Math.max(0, Math.min(100, Math.round((1 - actionableCount / rawEventCount) * 1000) / 10));
    } else if (alertCount > 0) {
      overallReductionRatio = deduplicationRatio;
    }
  }

  return {
    rawEventCount,
    alertCount,
    incidentCount,
    groupedAlertCount,
    ungroupedAlertCount,
    actionableCount,
    deduplicationRatio,
    groupingRatio,
    overallReductionRatio
  };
}
