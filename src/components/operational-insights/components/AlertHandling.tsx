/**
 * © Copyright IBM Corp. 2026
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Tile } from '@carbon/react';
import { AlertHandlingStat } from '../../../helpers/getAlertHandlingStats';

export interface AlertHandlingProps {
  stats: AlertHandlingStat[];
}

export const AlertHandling: React.FC<AlertHandlingProps> = ({ stats }) => {
  return (
    <Tile className="insights-handling-card">
      {stats.map((stat) => (
        <div key={stat.key} className="insights-handling-stat">
          <div className="insights-kpi-label">{stat.label}</div>
          <div className="insights-handling-values">
            <span className="insights-handling-count">{stat.count.toLocaleString()}</span>
            <span className="insights-handling-percent">{stat.percent}%</span>
          </div>
        </div>
      ))}
    </Tile>
  );
};

export default AlertHandling;
