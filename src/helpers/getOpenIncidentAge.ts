/**
 * © Copyright IBM Corp. 2026
 * SPDX-License-Identifier: Apache-2.0
 */

export interface OpenIncidentRecord {
  id?: string;
  priority?: number | string;
  state?: string;
  owner?: string;
  createdTime?: string | number;
  [key: string]: any;
}

export interface OpenIncidentAgeResult {
  openCount: number;
  unassignedCount: number;
  oldestMinutes: number;
  oldestFormatted: string;
  avgAgeMinutes: number;
  avgAgeFormatted: string;
  countByPriority: Record<number, number>;
  avgAgeByPriority: Record<number, number>;
  avgAgeByPriorityFormatted: Record<number, string>;
}

const RESOLVED_STATES = ['resolved', 'closed', 'complete'];

export function formatDuration(minutes: number): string {
  if (isNaN(minutes) || minutes <= 0) {
    return '0m';
  }
  if (minutes < 60) {
    return `${Math.round(minutes)}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  if (hours < 24) {
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }
  const days = Math.floor(hours / 24);
  const remainingHours = Math.round(hours % 24);
  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
}

/**
 * Age of incidents that are still open (live data): now - createdTime, overall and per priority.
 */
export function getOpenIncidentAge(
  incidents: OpenIncidentRecord[] = [],
  nowMs: number = Date.now()
): OpenIncidentAgeResult {
  const countByPriority: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const agesByPriority: Record<number, number[]> = { 1: [], 2: [], 3: [], 4: [], 5: [] };
  const allAges: number[] = [];
  let openCount = 0;
  let unassignedCount = 0;

  (Array.isArray(incidents) ? incidents : []).forEach((incident) => {
    const state = (incident.state || '').toLowerCase();
    if (RESOLVED_STATES.includes(state)) {
      return;
    }

    openCount++;
    const pri = Math.max(1, Math.min(5, Number(incident.priority) || 3));
    countByPriority[pri]++;
    if (!incident.owner) {
      unassignedCount++;
    }

    const created = incident.createdTime ? new Date(incident.createdTime).getTime() : NaN;
    if (!isNaN(created) && created <= nowMs) {
      const ageMinutes = (nowMs - created) / (1000 * 60);
      allAges.push(ageMinutes);
      agesByPriority[pri].push(ageMinutes);
    }
  });

  const average = (list: number[]) => (list.length > 0 ? list.reduce((sum, v) => sum + v, 0) / list.length : 0);
  const avgAge = average(allAges);
  const oldest = allAges.length > 0 ? Math.max(...allAges) : 0;

  const avgAgeByPriority: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const avgAgeByPriorityFormatted: Record<number, string> = { 1: '0m', 2: '0m', 3: '0m', 4: '0m', 5: '0m' };
  for (let p = 1; p <= 5; p++) {
    const avg = average(agesByPriority[p]);
    avgAgeByPriority[p] = Math.round(avg * 10) / 10;
    avgAgeByPriorityFormatted[p] = formatDuration(avg);
  }

  return {
    openCount,
    unassignedCount,
    oldestMinutes: Math.round(oldest * 10) / 10,
    oldestFormatted: formatDuration(oldest),
    avgAgeMinutes: Math.round(avgAge * 10) / 10,
    avgAgeFormatted: formatDuration(avgAge),
    countByPriority,
    avgAgeByPriority,
    avgAgeByPriorityFormatted
  };
}
