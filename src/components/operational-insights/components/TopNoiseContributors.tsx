/**
 * © Copyright IBM Corp. 2026
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { Tile, Tag } from '@carbon/react';
import { ResourceNoiseItem } from '../../../helpers/useInsightsData';

// @ts-ignore
import getReactRenderer from '@ibm/akora-renderer-react';

const ReactRenderer = typeof getReactRenderer === 'function' ? getReactRenderer(React, ReactDOM) : null;
const { useAkoraState, setUrlParameters } = ReactRenderer?.components || {};

export interface TopNoiseContributorsProps {
  topResources: ResourceNoiseItem[];
}

export const TopNoiseContributors: React.FC<TopNoiseContributorsProps> = ({ topResources }) => {
  const akora = useAkoraState ? useAkoraState() : null;

  const handleResourceClick = (resourceName: string) => {
    if (akora?.app && akora?.state) {
      const filterwhereclause = `resource.name = '${resourceName}'`;
      const newRoute = setUrlParameters(
        akora.state?.resolvedFullPath || akora.state?.fullPath || '/alerts',
        { filtername: `Alerts for ${resourceName}`, filterwhereclause }
      );
      akora.app.replaceRoute(newRoute);
    }
  };

  const getSeverityTagType = (severity: string): 'red' | 'magenta' | 'purple' | 'blue' | 'cyan' | 'teal' | 'gray' => {
    const sev = (severity || '').toLowerCase();
    if (sev === 'critical' || sev === '6') return 'red';
    if (sev === 'major' || sev === '5') return 'magenta';
    if (sev === 'minor' || sev === '4') return 'purple';
    if (sev === 'warning' || sev === '3') return 'blue';
    if (sev === 'information' || sev === '2') return 'cyan';
    return 'gray';
  };

  return (
    <Tile className="insights-panel-tile insights-top-noise">
      <div className="insights-panel-header">
        <h4 className="insights-panel-title">Top noise resources</h4>
        <span className="insights-panel-subtitle">Resources generating the highest volume of raw telemetry</span>
      </div>

      <div className="insights-resource-list">
        {topResources.length === 0 ? (
          <div className="insights-empty-state">No noisy resources found in this timeframe.</div>
        ) : (
          topResources.map((item, idx) => (
            <div
              key={item.resource}
              className="insights-resource-row"
              onClick={() => handleResourceClick(item.resource)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleResourceClick(item.resource);
                }
              }}
            >
              <div className="insights-resource-rank">#{idx + 1}</div>
              <div className="insights-resource-info">
                <span className="insights-resource-name" title={item.resource}>
                  {item.resource}
                </span>
                <span className="insights-resource-counts">
                  {item.eventCount.toLocaleString()} events · {item.alertCount.toLocaleString()} alerts
                </span>
              </div>
              <div className="insights-resource-badge">
                <Tag type={getSeverityTagType(item.maxSeverity)} size="sm">
                  {item.maxSeverity}
                </Tag>
              </div>
            </div>
          ))
        )}
      </div>
    </Tile>
  );
};

export default TopNoiseContributors;
