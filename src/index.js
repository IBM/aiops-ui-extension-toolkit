/**
 * © Copyright IBM Corp. 2022, 2025
 * SPDX-License-Identifier: Apache-2.0
 */

import getReactRenderer from '@ibm/akora-renderer-react';
import React from 'react';
import ReactDOM from 'react-dom/client';

const ReactRenderer = getReactRenderer(React, ReactDOM);

export const SimpleSamplePanel = {
  renderer: ReactRenderer,
  state: {
    component: () => import('./panels/sample.panel')
  }
};

export const AlertsWorkflowPanel = {
  renderer: ReactRenderer,
  state: {
    component: () => import('./panels/alerts-workflow.panel')
  }
};

export const TopNPanel = {
  renderer: ReactRenderer,
  state: {
    component: () => import('./panels/top-n.panel')
  }
};

export const TopNIncidentsPanel = {
  renderer: ReactRenderer,
  state: {
    component: () => import('./panels/top-n-incidents.panel')
  }
};

export const ApplicationHeatmapPanel = {
  renderer: ReactRenderer,
  state: {
    component: () => import('./panels/application-heatmap.panel')
  }
};

export const AlertsTimelinePanel = {
  renderer: ReactRenderer,
  state: {
    component: () => import('./panels/alerts-timeline-panel')
  }
};

export const IncidentsPieChart = {
  renderer: ReactRenderer,
  state: {
    component: () => import('./panels/incidents-pie-chart.panel')
  }
};

export const MonitorBoxes = {
  renderer: ReactRenderer,
  state: {
    component: () => import('./panels/monitor-boxes.panel'),
    stateToPropMapper: (state) => (
      {...state}
    )
  }
};

window.registerCustomPanel('hello-world', SimpleSamplePanel);
window.registerCustomPanel('alerts-workflow', AlertsWorkflowPanel);
window.registerCustomPanel('top-n', TopNPanel);
window.registerCustomPanel('top-n-incidents', TopNIncidentsPanel);
window.registerCustomPanel('application-heatmap', ApplicationHeatmapPanel);
window.registerCustomPanel('alerts-timeline', AlertsTimelinePanel);
window.registerCustomPanel('incidents-pie-chart', IncidentsPieChart);
window.registerCustomPanel('monitor-boxes', MonitorBoxes);
