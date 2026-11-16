/**
 * © Copyright IBM Corp. 2026
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Tile } from '@carbon/react';
import { CorrelationBreakdownItem } from '../../../helpers/getCorrelationBreakdown';

export interface CorrelationBreakdownProps {
  correlationBreakdown: CorrelationBreakdownItem[];
}

export const CorrelationBreakdown: React.FC<CorrelationBreakdownProps> = ({ correlationBreakdown }) => {
  const maxAlerts = Math.max(1, ...correlationBreakdown.map((item) => item.alertCount));
  const hasData = correlationBreakdown.some((item) => item.groupCount > 0);

  return (
    <Tile className="insights-panel-tile insights-correlation-tile">
      <div className="insights-panel-header">
        <div className="insights-panel-title-group">
          <h4 className="insights-panel-title">Correlations used</h4>
          <span className="insights-panel-subtitle">
            Groups of alerts sharing a correlation id, by mechanism
          </span>
        </div>
      </div>

      {hasData ? (
        <div className="insights-correlation-list">
          {correlationBreakdown.map((item) => (
            <div key={item.key} className="insights-correlation-row">
              <div className="insights-correlation-meta">
                <span className="insights-correlation-label">{item.label}</span>
                <span className="insights-correlation-counts">
                  {item.groupCount.toLocaleString()} {item.groupCount === 1 ? 'group' : 'groups'} ·{' '}
                  {item.alertCount.toLocaleString()} {item.alertCount === 1 ? 'alert' : 'alerts'}
                </span>
              </div>
              <div className="insights-correlation-track">
                <div
                  className={`insights-correlation-bar insights-correlation-bar--${item.key}`}
                  style={{ width: `${(item.alertCount / maxAlerts) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="insights-empty-state">No correlated alert groups in this timeframe.</div>
      )}
    </Tile>
  );
};

export default CorrelationBreakdown;
