/**
 * © Copyright IBM Corp. 2026
 * SPDX-License-Identifier: Apache-2.0
 */

import { INSIGHT_PATH } from '../components/shared/utils/filterUtils';

export interface CorrelationBreakdownItem {
  key: string;
  label: string;
  /** Number of correlation ids shared by two or more alerts */
  groupCount: number;
  /** Number of alerts that belong to one of those groups */
  alertCount: number;
}

export const CORRELATION_MECHANISMS = [
  { key: 'temporal', label: 'Temporal', column: INSIGHT_PATH.temporal },
  { key: 'topological', label: 'Topological', column: INSIGHT_PATH.subTopologyGroup },
  { key: 'scope', label: 'Scope-based', column: INSIGHT_PATH.scopeGroup }
];

/**
 * Extract the correlation ids from an alert insight cell. The cell is normally a JSON string
 * of `[{ id, type, source, details }]`, but an already parsed array is also accepted.
 */
export function parseCorrelationIds(cell: unknown): string[] {
  let parsed: unknown = cell;
  if (typeof cell === 'string') {
    try {
      parsed = JSON.parse(cell);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(parsed)) return [];
  return parsed
    .map((insight) => (insight && typeof insight === 'object' ? (insight as { id?: unknown }).id : undefined))
    .filter((id): id is string => typeof id === 'string' && id.length > 0);
}

/**
 * Count, per correlation mechanism, the groups that are actually valid, i.e. a correlation id
 * shared by at least two alerts. Ids that only a single alert references are ignored.
 *
 * @param alertRows alert rows
 * @param getValue reads a column value from a row
 */
export function getCorrelationBreakdown(
  alertRows: Array<Record<string, any>>,
  getValue: (row: Record<string, any>, column: string) => unknown
): CorrelationBreakdownItem[] {
  return CORRELATION_MECHANISMS.map(({ key, label, column }) => {
    const alertsPerId = new Map<string, number>();

    alertRows.forEach((row) => {
      // De-duplicate in case the same id is listed twice on one alert
      new Set(parseCorrelationIds(getValue(row, column))).forEach((id) => {
        alertsPerId.set(id, (alertsPerId.get(id) || 0) + 1);
      });
    });

    let groupCount = 0;
    let alertCount = 0;
    alertsPerId.forEach((count) => {
      if (count >= 2) {
        groupCount += 1;
        alertCount += count;
      }
    });

    return { key, label, groupCount, alertCount };
  });
}
