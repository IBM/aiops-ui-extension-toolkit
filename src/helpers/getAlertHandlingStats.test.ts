/**
 * © Copyright IBM Corp. 2026
 * SPDX-License-Identifier: Apache-2.0
 */

import { getAlertHandlingStats } from './getAlertHandlingStats';

const getValue = (row: Record<string, any>, column: string) => row[column];

describe('getAlertHandlingStats', () => {
  it('returns zeros for no alerts', () => {
    const stats = getAlertHandlingStats([], getValue, 0);
    expect(stats.map((s) => [s.count, s.percent])).toEqual([[0, 0], [0, 0], [0, 0]]);
  });

  it('counts acknowledged, assigned and grouped alerts with percentages', () => {
    const rows: Array<Record<string, any>> = [
      { acknowledged: 'true', owner: 'alice' },
      { acknowledged: 'false', owner: '-' },
      { acknowledged: true, owner: null },
      { acknowledged: 'false', owner: '' }
    ];
    const [ack, assigned, grouped] = getAlertHandlingStats(rows, getValue, 1);

    expect(ack).toMatchObject({ key: 'acknowledged', count: 2, percent: 50 });
    expect(assigned).toMatchObject({ key: 'assigned', count: 1, percent: 25 });
    expect(grouped).toMatchObject({ key: 'grouped', count: 1, percent: 25 });
  });

  it('never reports more grouped alerts than there are alerts', () => {
    const [, , grouped] = getAlertHandlingStats([{ owner: 'a' }], getValue, 5);
    expect(grouped).toMatchObject({ count: 1, percent: 100 });
  });
});
