/**
 * © Copyright IBM Corp. 2026
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AlertHandlingStat {
  key: 'acknowledged' | 'assigned' | 'grouped';
  label: string;
  count: number;
  /** Percentage of all alerts, rounded to one decimal place */
  percent: number;
}

const isTruthy = (value: unknown): boolean => value === true || String(value).toLowerCase() === 'true';

// Unassigned alerts come back as null, empty or a '-' placeholder
const isAssigned = (owner: unknown): boolean => {
  if (owner === null || owner === undefined) return false;
  const text = String(owner).trim();
  return text !== '' && text !== '-';
};

const toPercent = (count: number, total: number): number =>
  total > 0 ? Math.round((count / total) * 1000) / 10 : 0;

/**
 * Acknowledged / assigned / grouped alert counts, each with its share of all alerts.
 *
 * @param alertRows alert rows
 * @param getValue reads a column value from a row
 * @param groupedAlertCount number of alerts that belong to an incident
 */
export function getAlertHandlingStats(
  alertRows: Array<Record<string, any>>,
  getValue: (row: Record<string, any>, column: string) => unknown,
  groupedAlertCount: number
): AlertHandlingStat[] {
  const total = alertRows.length;
  let acknowledged = 0;
  let assigned = 0;

  alertRows.forEach((row) => {
    if (isTruthy(getValue(row, 'acknowledged'))) acknowledged++;
    if (isAssigned(getValue(row, 'owner'))) assigned++;
  });

  const grouped = Math.min(groupedAlertCount, total);

  return [
    { key: 'acknowledged', label: 'Alerts acknowledged', count: acknowledged, percent: toPercent(acknowledged, total) },
    { key: 'assigned', label: 'Alerts assigned', count: assigned, percent: toPercent(assigned, total) },
    { key: 'grouped', label: 'Alerts grouped', count: grouped, percent: toPercent(grouped, total) }
  ];
}
