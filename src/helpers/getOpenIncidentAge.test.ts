/**
 * © Copyright IBM Corp. 2026
 * SPDX-License-Identifier: Apache-2.0
 */

import { getOpenIncidentAge, formatDuration } from './getOpenIncidentAge';

describe('getOpenIncidentAge', () => {
  const now = new Date('2026-01-01T12:00:00.000Z').getTime();

  it('handles empty input gracefully', () => {
    const res = getOpenIncidentAge([], now);
    expect(res.openCount).toBe(0);
    expect(res.unassignedCount).toBe(0);
    expect(res.avgAgeFormatted).toBe('0m');
    expect(res.oldestFormatted).toBe('0m');
  });

  it('calculates age of open incidents only, overall and per priority', () => {
    const incidents = [
      { id: 'inc-1', priority: 1, state: 'inProgress', owner: 'alice', createdTime: '2026-01-01T11:30:00.000Z' }, // 30m
      { id: 'inc-2', priority: 1, state: 'new', createdTime: '2026-01-01T10:30:00.000Z' }, // 90m, unassigned
      { id: 'inc-3', priority: 2, state: 'onHold', owner: 'bob', createdTime: '2026-01-01T00:00:00.000Z' }, // 12h
      { id: 'inc-4', priority: 2, state: 'resolved', createdTime: '2025-12-01T00:00:00.000Z' } // ignored
    ];

    const res = getOpenIncidentAge(incidents, now);
    expect(res.openCount).toBe(3);
    expect(res.unassignedCount).toBe(1);
    expect(res.countByPriority[1]).toBe(2);
    expect(res.countByPriority[2]).toBe(1);
    expect(res.avgAgeByPriority[1]).toBe(60);
    expect(res.avgAgeByPriorityFormatted[1]).toBe('1h');
    expect(res.oldestMinutes).toBe(720);
    expect(res.oldestFormatted).toBe('12h');
    expect(res.avgAgeMinutes).toBe(280);
    expect(res.avgAgeFormatted).toBe('4h 40m');
  });

  it('formats various durations accurately', () => {
    expect(formatDuration(0)).toBe('0m');
    expect(formatDuration(25)).toBe('25m');
    expect(formatDuration(60)).toBe('1h');
    expect(formatDuration(95)).toBe('1h 35m');
    expect(formatDuration(1500)).toBe('1d 1h');
  });
});
