/**
 * © Copyright IBM Corp. 2022, 2025
 * SPDX-License-Identifier: Apache-2.0
 */

export const COLORS = [
  '#e0e0e0', // clear
  '#e8daff', // indeterminate
  '#d0e2ff', // information
  '#4589ff', // warning
  '#fddc69', // minor
  '#ffb784', // major
  '#ff8389'  // critical
];

export const COLORS_STROKE = [
  '#161616', // clear
  '#8a3ffc', // indeterminate
  '#0f62fe', // information
  '#4589ff', // warning
  '#f1c21b', // minor
  '#ff832b', // major
  '#da1e28'  // critical
];

export const PRIORITY_COLORS = [
  '#999999',
  '#b380cc',
  '#6680ff',
  '#75c2c2',
  '#e66666'
];

export const PRIORITY_COLORS_STROKE = [
  '#e0e0e0',
  '#e8daff',
  '#d0e2ff',
  '#9ef0f0',
  '#ffd7d9'
];

export const PLEASANT_COLORS = [
  '#054ADA', // Blue 40
  '#4178BE', // Blue 60
  '#71A0D6', // Blue 80
  '#B4CCDC', // Blue 10
  '#4A6A8A', // Gray 70
  '#6F8FAF', // Gray 50
  '#AAB8C2', // Gray 30
  '#D3D7DB', // Gray 10
  '#293134', // Black
  '#F3F3F3', // White
  '#F7F7F7', // Gray 5
  '#CFDCDC', // Teal 10
  '#54B5B5', // Teal 40
  '#009999', // Teal 60
  '#007575', // Teal 80
  '#FF6666', // Red 40
  '#FF3333', // Red 60
  '#CC0000', // Red 80
  '#FFB3B3', // Pink 40
  '#FF8080', // Pink 60
]

export const ALERT_QUERY_PARAMS = {
  tenantId: 'cfd95b7e-3bc7-4006-a4a8-a73a79c71255',
  columns: [
    'severity',
    '@insights.type=\'aiops.ibm.com/insight-type/business/criticality\'',
    'state',
    'summary',
    'type.classification',
    'sender.name',
    'resource.name',
    'firstOccurrenceTime',
    'lastOccurrenceTime',
    'closedTime',
    '@insights.type=\'aiops.ibm.com/insight-type/runbook\'',
    '@insights.type=\'aiops.ibm.com/insight-type/topology/resource\'',
    '@insights.type=\'aiops.ibm.com/insight-type/seasonal-occurrence\'',
    'relatedContextualStoryIds',
    'relatedStoryIds',
    '@insights.type=\'aiops.ibm.com/insight-type/lad/resolutions\'',
    '@insights.type=\'aiops.ibm.com/insight-type/lad/templates\'',
    'suppressed',
    '@insights.type=\'aiops.ibm.com/insight-type/anomaly\'',
    '@insights.type=\'aiops.ibm.com/insight-type/relationship/causal\' and insights.source=\'aiops.ibm.com/insight-source/relationship/causal/topological-group\'',
    '@insights.type=\'aiops.ibm.com/insight-type/relationship/causal\' and insights.source=\'aiops.ibm.com/insight-source/relationship/causal/custom\'',
    '@insights.type=\'aiops.ibm.com/insight-type/relationship/causal\' and insights.source=\'aiops.ibm.com/insight-source/relationship/causal/temporal\'',
    'owner',
    'team',
    'acknowledged',
    '@insights.type=\'aiops.ibm.com/insight-type/golden-signal\'',
    'aiops.ibm.com/insight-source/relationship/causal/custom',
    'id',
    'signature',
    '@insights.type=\'aiops.ibm.com/insight-type/relationship/causal-union\'',
    '@insights.type=\'aiops.ibm.com/insight-type/topology/group\'',
    // Appended last so existing column indexes used by other panels are unchanged
    'eventCount'
  ],
  filter: 'state != \'clear\'',
  format: 'AIOPS'
};

export const INCIDENT_QUERY_PARAMS = {
  tenantId: 'cfd95b7e-3bc7-4006-a4a8-a73a79c71255',
  fetchPolicy: 'network-only',
  nextFetchPolicy: 'cache-and-network',
  notifyOnNetworkStatusChange: true,
  pollInterval: 60 * 1000, // poll for stories every 1 minute
};

export const INCIDENT_COLUMNS = [
  'id',
  'title',
  'description',
  'priority',
  'state',
  'owner',
  'team',
  'alertIds',
  'contextualAlertIds',
  'insights',
  'createdTime',
];

export const INCIDENT_GROUPBY = [
  { label: 'By description', value: 'description' },
  { label: 'By priority', value: 'priority' },
  { label: 'By status', value: 'state' },
  { label: 'By owner', value: 'owner' },
  { label: 'By user group', value: 'team' },
  { label: 'By insights type', value: 'insights.type' },
];

export const SEVERITIES = [
  'Clear',
  'Indeterminate',
  'Information',
  'Warning',
  'Minor',
  'Major',
  'Critical'
];

export const GROUP_BY = [
  {
    label: 'All',
    value: null
  },
  {
    label: 'By resource',
    value: 'resource.name'
  },
  {
    label: 'By team',
    value: 'team'
  },
  {
    label: 'By type',
    value: 'type.classification'
  }
];

export const TOP_N_TIMEFRAME = (timeProp: string) => [
  {
    label: 'All open',
    value: null
  },
  {
    label: 'Last 24 hours',
    value: `${timeProp} > '${new Date(new Date().setHours(-24)).toISOString()}'`
  },
  {
    label: 'Older than 48 hours',
    value: `${timeProp} < '${new Date(new Date().setHours(-48)).toISOString()}'`
  }
];

export const INCIDENT_COUNT_THRESHOLD = {
  4: '#FF0000',
  2: '#FFBF00',
  1: '#00FF00'
};

export const PIECHART_TIMEFRAME = [
  {
    label: 'All open',
    value: null
  },
  {
    label: 'Last 48 hours',
    value: `createdTime > '${new Date(new Date().setHours(-48)).toISOString()}'`
  },
  {
    label: 'Older than 48 hours',
    value: `createdTime < '${new Date(new Date().setHours(-48)).toISOString()}'`
  }
];

export const PIECHART_ALERTSCOUNT = [
  {
    label: 'All alerts',
    value: 0
  },
  {
    label: 'Alert count > 5',
    value: 5
  },
  {
    label: 'Alert count > 25',
    value: 25
  },
  {
    label: 'Alert count > 100',
    value: 100
  }
];

export const LINE_CHART_OPTIONS: object = {
  axes: {
    bottom: {
      title: 'Occurrence time',
      mapsTo: 'date',
      scaleType: 'time'
    },
    left: {
      mapsTo: 'value',
      title: 'Open alerts',
      scaleType: 'linear'
    }
  },
  curve: 'curveMonotoneX',
  getStrokeColor: (g: string) => {
    const severity = g.split('_')[0];
    const severityIndex = SEVERITIES.indexOf(severity);
    if (severityIndex > -1) {
      return COLORS_STROKE[severityIndex];
    }
    return COLORS_STROKE[0];
  },
  timeScale: {
    addSpaceOnEdges: 0
  },
  width: '90vw'
}

export const DROPDOWN_ITEMS : {[key: string]: string} = {
  '15Min': 'Last 15 minutes',
  '24Hr': 'Last 24 hours'
}

export const INSIGHTS_TIMEFRAMES = [
  { label: 'Last 1 hour', value: '1h', hours: 1 },
  { label: 'Last 24 hours', value: '24h', hours: 24 },
  { label: 'Last 7 days', value: '7d', hours: 24 * 7 },
  { label: 'Last 30 days', value: '30d', hours: 24 * 30 },
  { label: 'Last 90 days', value: '90d', hours: 24 * 90 },
];

export const ALL_SEVS_FIRST_OCC = 'AllSeverities_first';
export const ALL_SEVS_LAST_OCC = 'AllSeverities_last';

export const ALL_APPS_FIRST_OCC = 'AllApplications_first';
export const ALL_APPS_LAST_OCC = 'AllApplications_last';
