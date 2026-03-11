/**
 * © Copyright IBM Corp. 2025
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { SimpleBarChart, ScaleTypes, type BarChartOptions, type ChartTabularData } from '@carbon/charts-react';
import { useQuery } from '#src/helpers/useQuery';
import type { AlertSummary, QueryResponse, MonitorBoxInterface } from './MonitorBoxTypes';

import '@carbon/charts-react/styles.css'
import './monitor-box.scss';

// @ts-ignore
import getReactRenderer from '@ibm/akora-renderer-react';

const ReactRenderer = getReactRenderer(React, ReactDOM);
const { useAkoraState } = ReactRenderer.components;

const className = 'monitor-box';

declare global {
  interface Window {
    akoraConfig: any;
  }
}

const defaultOptions: BarChartOptions = {
  theme: 'g90', // Dark theme for Carbon Charts
  axes: {
    left: {
      mapsTo: 'value'
    },
    bottom: {
      mapsTo: 'group',
      scaleType: ScaleTypes.LABELS,
      ticks: {
        values: []
      }
    }
  },
  getFillColor: (group: number) => sevColors[group],
  grid: {
    x: {
      enabled: false
    },
    y: {
      enabled: false
    }
  },
  height: '160px',
  legend: {
    enabled: false,
  },
  toolbar: {
    enabled: false
  }
};

const initialData = [
  {
    group: '1',
    value: 0
  },
  {
    group: '2',
    value: 0
  },
  {
    group: '3',
    value: 0
  },
  {
    group: '4',
    value: 0
  },
  {
    group: '5',
    value: 0
  },
  {
    group: '6',
    value: 0
  }
];

interface SeverityColour {
  [key: number]: string
}

const sevColors: SeverityColour = {
  1: '#B23AEE',
  2: '#3f71b2',
  3: '#408BFC',
  4: '#FDD13A',
  5: '#FC7B1E',
  6: '#DA1E28',
};

function getHighest(summaryData: AlertSummary[]) {
  if (summaryData.length === 0) {
    return null;
  }
  let highestSeverity: number;
  summaryData.forEach(summary => {
    if (summary.count > 0 && (!highestSeverity || summary.severity > highestSeverity)) {
      highestSeverity = summary.severity;
    }
  });
  return highestSeverity;
}

function getLowest(summaryData: AlertSummary[]) {
  if (summaryData.length === 0) {
    return null;
  }
  let lowestSeverity: number;
  summaryData.forEach(summary => {
    if (summary.count > 0 && (!lowestSeverity || summary.severity < lowestSeverity)) {
      lowestSeverity = summary.severity;
    }
  });
  return lowestSeverity;
}

export default function MonitorBox (props: MonitorBoxInterface) {
  const {
    title,
    filterClause,
    onBoxClick,
    shouldRefetch,
    data,
    loading,
    error
  } = props;
  const monitorBoxId = `monitor-box_${title}`;
  const [monitorBoxData, setMonitorBoxData] = useState();
  const [monitorBoxOptions, setMonitorBoxOptions] = useState(defaultOptions);

  const { state: akoraState } = useAkoraState();

  // Process data for summaries here
  const summaries = useMemo(() => {
    return {
      total: {
        title: 'Total',
        value: data ? data?.tenant?.alertSummary.summary.reduce((acc: number, cur: AlertSummary) => acc + cur.count, 0) : null
      },
      highest: {
        title: 'Highest',
        value: data ? getHighest(data.tenant.alertSummary.summary) : null
      },
      lowest: {
        title: 'Lowest',
        value: data ? getLowest(data.tenant.alertSummary.summary) : null
      }
    };
  }, [data]);


  useEffect(() => {
    setMonitorBoxOptions({
      ...monitorBoxOptions,
      data: {
        loading
      }
    });
  }, [loading]);

  useEffect(() => {
    let newData: ChartTabularData = [];
    initialData.forEach(initialDataPoint => {
      const summary = data && 'alertSummary' in data.tenant ? data?.tenant.alertSummary.summary.find(
        (summaryDataPoint: AlertSummary) => summaryDataPoint.severity.toString() === initialDataPoint.group
      ) : null;
      if (summary) {
        newData.push({
          group: summary.severity.toString(),
          value: summary.count
        });
      } else {
        newData.push(initialDataPoint);
      }
    });
    setMonitorBoxData(newData);
  }, [data]);

  const getSummaryRow = (title: string, value: ReactNode) => {
    return (
      <div className={`${className}__summary-row`}>
        <div className={`${className}__summary-row_left`}>{title}</div>
        <div className={`${className}__summary-row_right`}>{value}</div>
      </div>
    )
  }

  const getSummaryRows = () => {
    const HighestSevIcon = summaries.highest.value ? akoraState.utils.getSeverityIcon(summaries.highest.value) : null;
    const LowestSevIcon = summaries.lowest.value ? akoraState.utils.getSeverityIcon(summaries.lowest.value) : null;

    return (
      <>
        {getSummaryRow(
          summaries.total.title,
          <div>{summaries.total.value}</div>
        )}
        {getSummaryRow(
          summaries.highest.title,
          summaries.highest.value ?
            <div className={`${className}__summary-icon-holder`}><HighestSevIcon/></div> :
            <div>-</div>
        )}
        {getSummaryRow(
          summaries.lowest.title,
          summaries.lowest.value ?
            <div className={`${className}__summary-icon-holder`}><LowestSevIcon/></div> :
            <div>-</div>
        )}
      </>
    )
  };

  // Check if there are no alerts
  const hasNoAlerts = summaries && summaries.total.value === 0;

  return (
    <div
      id={monitorBoxId}
      className={`${className} ${hasNoAlerts ? `${className}--empty` : ''}`}
      role='contentinfo'
      onClick={() => onBoxClick()}
    >
      <div className={`${className}__heading`}>
        {title}
      </div>
      {
        error ?
          <div className={`${className}__error`}>
            Error loading data for this monitor box.
          </div> :
          <>
            <div className={`${className}__summary`}>
              {summaries && getSummaryRows()}
            </div>
            <div className={`${className}__chart`}>
              <SimpleBarChart
                data={monitorBoxData || initialData}
                options={monitorBoxOptions}
              />
            </div>
          </>
      }
    </div>
  );
}