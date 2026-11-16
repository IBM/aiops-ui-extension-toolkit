/**
 * © Copyright IBM Corp. 2026
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Tile } from '@carbon/react';
import { TopIncidentItem } from '../../../helpers/useInsightsData';
import { PRIORITY_COLORS } from '../../constants';

export interface TopIncidentsProps {
  topIncidents: TopIncidentItem[];
}

const PRIORITY_LABELS: Record<number, string> = {
  1: 'P1',
  2: 'P2',
  3: 'P3',
  4: 'P4',
  5: 'P5'
};

// PRIORITY_COLORS is ordered from P5 (index 0) to P1 (index 4)
const getPriorityColor = (priority: number): string =>
  PRIORITY_COLORS[Math.min(4, Math.max(0, 5 - priority))];

export const TopIncidents: React.FC<TopIncidentsProps> = ({ topIncidents }) => {
  return (
    <Tile className="insights-panel-tile insights-top-incidents">
      <div className="insights-panel-header">
        <div className="insights-panel-title-group">
          <h4 className="insights-panel-title">Biggest incidents by priority, alert count</h4>
          <span className="insights-panel-subtitle">Top 10, sorted by priority then alert count</span>
        </div>
      </div>

      {topIncidents.length === 0 ? (
        <div className="insights-empty-state">No incidents in this timeframe.</div>
      ) : (
        <div className="insights-incident-list">
          {topIncidents.map((incident) => (
            <div key={incident.id} className="insights-incident-row">
              <span
                className="insights-incident-priority"
                style={{ borderLeft: `4px solid ${getPriorityColor(incident.priority)}` }}
              >
                {PRIORITY_LABELS[incident.priority] || `P${incident.priority}`}
              </span>
              <span className="insights-incident-title" title={incident.title}>
                {incident.title}
              </span>
              <span className="insights-incident-alerts">
                {incident.alertCount.toLocaleString()} {incident.alertCount === 1 ? 'alert' : 'alerts'}
              </span>
            </div>
          ))}
        </div>
      )}
    </Tile>
  );
};

export default TopIncidents;
