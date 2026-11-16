/**
 * © Copyright IBM Corp. 2026
 * SPDX-License-Identifier: Apache-2.0
 */

import { getCorrelationBreakdown, parseCorrelationIds, CORRELATION_MECHANISMS } from './getCorrelationBreakdown';

const scope = CORRELATION_MECHANISMS.find((m) => m.key === 'scope')!.column;
const topo = CORRELATION_MECHANISMS.find((m) => m.key === 'topological')!.column;

const cell = (...ids: string[]) => JSON.stringify(ids.map((id) => ({ id, type: 'causal' })));
const getValue = (row: Record<string, any>, column: string) => row[column];

describe('parseCorrelationIds', () => {
  it('returns ids from a JSON string or array', () => {
    expect(parseCorrelationIds(cell('a', 'b'))).toEqual(['a', 'b']);
    expect(parseCorrelationIds([{ id: 'a' }])).toEqual(['a']);
  });

  it('returns an empty list for empty, null or invalid input', () => {
    expect(parseCorrelationIds(null)).toEqual([]);
    expect(parseCorrelationIds('not json')).toEqual([]);
    expect(parseCorrelationIds('[]')).toEqual([]);
  });
});

describe('getCorrelationBreakdown', () => {
  it('ignores correlation ids that are not shared by multiple alerts', () => {
    const rows = [
      { [scope]: cell('s1'), [topo]: cell('t1') },
      { [scope]: cell('s1'), [topo]: cell('t2') },
      { [scope]: cell('s2') }
    ];
    const result = getCorrelationBreakdown(rows, getValue);
    expect(result.find((r) => r.key === 'scope')).toMatchObject({ groupCount: 1, alertCount: 2 });
    expect(result.find((r) => r.key === 'topological')).toMatchObject({ groupCount: 0, alertCount: 0 });
  });

  it('counts each group once and every alert in it', () => {
    const rows = [
      { [topo]: cell('t1') },
      { [topo]: cell('t1') },
      { [topo]: cell('t1') },
      { [topo]: cell('t2') },
      { [topo]: cell('t2') }
    ];
    expect(getCorrelationBreakdown(rows, getValue).find((r) => r.key === 'topological')).toMatchObject({
      groupCount: 2,
      alertCount: 5
    });
  });
});
