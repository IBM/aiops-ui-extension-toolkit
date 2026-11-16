/**
 * © Copyright IBM Corp. 2026
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Tile, ProgressBar } from '@carbon/react';
import { OpenIncidentAgeResult } from '../../../helpers/getOpenIncidentAge';
import { PRIORITY_COLORS } from '../../constants';

export interface OpenIncidentAgeProps {
  openAge: OpenIncidentAgeResult;
}

export const OpenIncidentAge: React.FC<OpenIncidentAgeProps> = ({ openAge }) => {
  const {
    openCount,
    unassignedCount,
    oldestFormatted,
    avgAgeFormatted,
    countByPriority,
    avgAgeByPriority,
    avgAgeByPriorityFormatted
  } = openAge;

  const priorities = [
    { level: 1, label: 'P1 - Critical', color: PRIORITY_COLORS[4] },
    { level: 2, label: 'P2 - Major', color: PRIORITY_COLORS[3] },
    { level: 3, label: 'P3 - Moderate', color: PRIORITY_COLORS[2] },
    { level: 4, label: 'P4 - Minor', color: PRIORITY_COLORS[1] },
    { level: 5, label: 'P5 - Low', color: PRIORITY_COLORS[0] },
  ];

  const maxMinutes = Math.max(1, ...Object.values(avgAgeByPriority));

  return (
    <Tile className="insights-panel-tile insights-open-age">
      <div className="insights-panel-header">
        <div className="insights-panel-title-group">
          <h4 className="insights-panel-title">Open Incident Age</h4>
          <span className="insights-panel-subtitle">How long open incidents have been waiting, by priority</span>
        </div>
        <div className="insights-age-kpi-badge">
          <span className="insights-badge-kpi-title">Average age</span>
          <span className="insights-badge-kpi-val">{avgAgeFormatted}</span>
        </div>
      </div>

      <div className="insights-age-summary-grid">
        <div className="insights-age-stat">
          <span className="insights-stat-label">Open</span>
          <span className="insights-stat-val">{openCount}</span>
        </div>
        <div className="insights-age-stat">
          <span className="insights-stat-label">Unassigned</span>
          <span className="insights-stat-val">{unassignedCount}</span>
        </div>
        <div className="insights-age-stat">
          <span className="insights-stat-label">Oldest</span>
          <span className="insights-stat-val">{oldestFormatted}</span>
        </div>
        <div className="insights-age-stat">
          <span className="insights-stat-label">Avg age</span>
          <span className="insights-stat-val">{avgAgeFormatted}</span>
        </div>
      </div>

      <div className="insights-age-priority-list">
        <div className="insights-priority-header">
          <span>Priority</span>
          <span />
          <span>Open / Avg age</span>
        </div>
        {priorities.map((p) => {
          const minutes = avgAgeByPriority[p.level] || 0;
          const formatted = avgAgeByPriorityFormatted[p.level] || '0m';
          const pct = Math.min(100, Math.round((minutes / maxMinutes) * 100));

          return (
            <div key={p.level} className="insights-priority-row">
              <span className="insights-priority-tag" style={{ borderLeft: `4px solid ${p.color}` }}>
                {p.label}
              </span>
              <ProgressBar
                label={p.label}
                hideLabel
                value={minutes > 0 ? Math.max(3, pct) : 0}
                max={100}
                className={`insights-priority-bar insights-priority-bar--${p.level}`}
              />
              <span className="insights-priority-duration">
                {countByPriority[p.level] || 0} / {formatted}
              </span>
            </div>
          );
        })}
      </div>
    </Tile>
  );
};

export default OpenIncidentAge;
