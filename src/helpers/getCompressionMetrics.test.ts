/**
 * © Copyright IBM Corp. 2026
 * SPDX-License-Identifier: Apache-2.0
 */

import { getCompressionMetrics } from './getCompressionMetrics';
import { ALERT_QUERY_PARAMS } from '../components/constants';

describe('getCompressionMetrics', () => {
  it('handles empty inputs', () => {
    const res = getCompressionMetrics({});
    expect(res.rawEventCount).toBe(0);
    expect(res.alertCount).toBe(0);
    expect(res.incidentCount).toBe(0);
    expect(res.overallReductionRatio).toBe(0);
  });

  it('calculates deduplication, grouping, and overall noise reduction ratio for full grouping', () => {
    const alerts = [
      { id: 'a1', eventCount: 10 },
      { id: 'a2', eventCount: 20 },
      { id: 'a3', eventCount: 70 },
      { id: 'a4', occurrenceCount: 100 }
    ]; // Total raw events = 200, Total alerts = 4

    const incidents = [
      { id: 'i1', alertIds: ['a1', 'a2'] },
      { id: 'i2', alertIds: ['a3', 'a4'] }
    ]; // Total incidents = 2, all 4 alerts grouped

    const res = getCompressionMetrics({ alerts, incidents });
    expect(res.rawEventCount).toBe(200);
    expect(res.alertCount).toBe(4);
    expect(res.incidentCount).toBe(2);
    expect(res.groupedAlertCount).toBe(4);
    expect(res.ungroupedAlertCount).toBe(0);
    expect(res.actionableCount).toBe(2);
    // Deduplication ratio: (1 - 4/200) * 100 = 98%
    expect(res.deduplicationRatio).toBe(98);
    // Grouping ratio: (1 - 2/4) * 100 = 50%
    expect(res.groupingRatio).toBe(50);
    // Overall noise reduction: (1 - 2/200) * 100 = 99%
    expect(res.overallReductionRatio).toBe(99);
  });

  it('correctly accounts for ungrouped alerts in partial grouping scenario', () => {
    const alerts = [
      { id: 'a1', eventCount: 1 },
      { id: 'a2', eventCount: 1 },
      { id: 'a3', eventCount: 1 },
      { id: 'a4', eventCount: 1 },
      { id: 'a5', eventCount: 1 }
    ]; // 5 raw events, 5 alerts

    // Incident i1 only groups a1 and a2; a3, a4, a5 are ungrouped loose alerts
    const incidents = [
      { id: 'i1', alertIds: ['a1', 'a2'] }
    ];

    const res = getCompressionMetrics({ alerts, incidents });
    expect(res.rawEventCount).toBe(5);
    expect(res.alertCount).toBe(5);
    expect(res.incidentCount).toBe(1);
    expect(res.groupedAlertCount).toBe(2);
    expect(res.ungroupedAlertCount).toBe(3);
    // Actionable count = 1 incident + 3 loose alerts = 4 items to triage
    expect(res.actionableCount).toBe(4);
    // Grouping ratio: (1 - 1/2) * 100 = 50%
    expect(res.groupingRatio).toBe(50);
    // Overall noise reduction: (1 - 4/5) * 100 = 20%, NOT (1 - 1/5) = 80%!
    expect(res.overallReductionRatio).toBe(20);
  });

  it('handles zero incidents without showing false 100% reduction', () => {
    const alerts = [
      { id: 'a1', eventCount: 10 },
      { id: 'a2', eventCount: 10 }
    ]; // 20 raw events, 2 alerts, 0 incidents
    const incidents: any[] = [];

    const res = getCompressionMetrics({ alerts, incidents });
    expect(res.rawEventCount).toBe(20);
    expect(res.alertCount).toBe(2);
    expect(res.incidentCount).toBe(0);
    expect(res.deduplicationRatio).toBe(90);
    expect(res.groupingRatio).toBe(0);
    // Overall reduction is the deduplication ratio, not 100%
    expect(res.overallReductionRatio).toBe(90);
  });

  it('respects rawEventOverride when provided', () => {
    const alerts = [{ id: 'a1' }, { id: 'a2' }];
    const incidents = [{ id: 'i1' }];
    const res = getCompressionMetrics({ alerts, incidents, rawEventOverride: 1000 });

    expect(res.rawEventCount).toBe(1000);
    expect(res.alertCount).toBe(2);
    expect(res.incidentCount).toBe(1);
    expect(res.overallReductionRatio).toBe(99.9);
  });

  it('reads the event count from the eventCount column of Akora fields rows', () => {
    const idx = ALERT_QUERY_PARAMS.columns.indexOf('eventCount');
    expect(idx).toBeGreaterThanOrEqual(0);

    const row = (count: string | null) => {
      const fields: Array<string | null> = new Array(ALERT_QUERY_PARAMS.columns.length).fill(null);
      fields[idx] = count;
      return { fields };
    };

    // 3 alerts that deduplicated 50 + 30 + 20 raw events
    const res = getCompressionMetrics({ alerts: [row('50'), row('30'), row('20')], incidents: [{ id: 'i1' }] });

    expect(res.alertCount).toBe(3);
    expect(res.rawEventCount).toBe(100);
    expect(res.deduplicationRatio).toBe(97);
  });

  it('falls back to 1 event per alert when the count column is empty', () => {
    const fields = new Array(ALERT_QUERY_PARAMS.columns.length).fill(null);
    const res = getCompressionMetrics({ alerts: [{ fields }, { fields }] });
    expect(res.rawEventCount).toBe(2);
  });
});
