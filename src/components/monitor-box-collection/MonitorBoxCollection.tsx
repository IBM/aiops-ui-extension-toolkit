/**
 * © Copyright IBM Corp. 2025
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom/client';

import { ActionableNotification, Loading, MultiSelect} from '@carbon/react';
// @ts-ignore
import getReactRenderer from '@ibm/akora-renderer-react';
import '@carbon/charts-react/styles.css'

import MonitorBox from '../shared/monitor-box/MonitorBox';
import { useQuery } from '#src/helpers/useQuery';
import { useAlertSummaries } from '#src/helpers/useAlertSummaries';
import { conditionSetToAPIQuery } from '../shared/utils/filterUtils';
import type { AlertFilter, AlertFilterParsed, QueryResponse } from '../shared/monitor-box/MonitorBoxTypes';

import './monitor-box-collection.scss';

const ReactRenderer = getReactRenderer(React, ReactDOM);
const { useAkoraState, setUrlParameters } = ReactRenderer.components;

const className = 'monitor-boxes';
const alertsPath = '/aiops/:tenantid/resolution-hub/alerts';

interface MonitorBoxCollectionProps {
  useAllFilters?: boolean;
  openNewAlertListOnClick?: boolean;
}

export default function MonitorBoxCollection({ useAllFilters = false, openNewAlertListOnClick = false  }: MonitorBoxCollectionProps) {
  const { app } = useAkoraState();
  const targetUrl = app.resolvePathExpression(alertsPath);

  const [selectedFilters, setSelectedFilters] = useState<AlertFilterParsed[]>([]);
  const [parsedFilters, setParsedFilters] = useState<AlertFilterParsed[]>([]);

  const queryName = useMemo(() => 'getFilters', []);
  const queryOptions = useMemo(() => ({
    tenantId: 'cfd95b7e-3bc7-4006-a4a8-a73a79c71255',
    condition: 'type = \'alert\''
  }), []);

  const {
    data: alertFiltersData,
    loading: alertFiltersLoading,
    error: alertFiltersError,
    refetch: alertFiltersRefetch
  }: QueryResponse = useQuery(queryName, queryOptions);

  useEffect(() => {
    if(alertFiltersData) {
      if ('filters' in alertFiltersData?.tenant) {
        const filters = alertFiltersData.tenant.filters.map((filter: AlertFilter) => ({
          filterName: filter.name,
          filterClause: conditionSetToAPIQuery(filter.conditionSet)
        }));
        setParsedFilters(filters);
      }
    }
  }, [alertFiltersData]);

  // Fetch alert summaries for selected filters or all filters based on mode
  const filtersToFetch = useAllFilters ? parsedFilters : selectedFilters;
  const { results: alertSummaries, loading: alertSummariesLoading, refetch: refetchAlertSummaries } = useAlertSummaries(filtersToFetch);

  useEffect(() => {
    const interval = setInterval(() => {
      refetchAlertSummaries();
    }, 60000);
    return () => {
      clearInterval(interval);
    };
  }, [refetchAlertSummaries]);

  // Separate filters into those with alerts and those without
  const { filtersWithAlerts, filtersWithoutAlerts } = useMemo(() => {
    const withAlerts: AlertFilterParsed[] = [];
    const withoutAlerts: AlertFilterParsed[] = [];

    // Use all filters or selected filters based on mode
    const filtersToSeparate = useAllFilters ? parsedFilters : selectedFilters;

    filtersToSeparate.forEach(filter => {
      const alertData = alertSummaries.get(filter.filterName);
      const hasAlerts = alertData?.hasAlerts ?? true; // Default to true while loading

      if (hasAlerts === false && !alertData?.loading) {
        withoutAlerts.push(filter);
      } else {
        withAlerts.push(filter);
      }
    });

    return { filtersWithAlerts: withAlerts, filtersWithoutAlerts: withoutAlerts };
  }, [useAllFilters, parsedFilters, selectedFilters, alertSummaries]);

  const onBoxClick = (filterName: string) => {
    if (openNewAlertListOnClick) {
      const newRoute = setUrlParameters(targetUrl, { filtername: filterName });
      window.open(newRoute);
    } else {
      const url = new URL(window.location.href);
      url.searchParams.set('filtername', filterName);
      window.history.pushState({}, '', url.toString());
      // Trigger a popstate event to notify the app of the URL change
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  }

  const onFilterSelect = (data: AlertFilterParsed[]) => {
    setSelectedFilters(data);
  }

  const getBody = () => {
    if (alertFiltersLoading) {
      return (
        <div className={className + '__loading'}>
          <Loading />
        </div>
      );
    } else if (alertFiltersError) {
      return (
        <div className={className + '__error'}>
          <ActionableNotification
            inline
            kind="error"
            title="Error loading filters"
            actionButtonLabel="Retry"
            onActionButtonClick={() => alertFiltersRefetch()}
          />
        </div>
      );
    }

    // Render all filters if asked for via props
    if (useAllFilters) {
      return (
        <>
          {filtersWithAlerts.length > 0 && (
            <>
              <div className={className + '__section-title'}>Filters with Alerts</div>
              <div className={className + '__collection'}>
                {filtersWithAlerts.map((filter) => {
                  const alertData = alertSummaries.get(filter.filterName);
                  return (
                    <MonitorBox
                      key={`monitor-box-alerts_${filter.filterName}`}
                      title={filter.filterName}
                      filterClause={filter.filterClause}
                      onBoxClick={() => onBoxClick(filter.filterName)}
                      shouldRefetch={false}
                      data={alertData?.data}
                      loading={alertData?.loading}
                      error={alertData?.error}
                    />
                  );
                })}
              </div>
            </>
          )}

          {filtersWithoutAlerts.length > 0 && (
            <div className={className + '__empty-section'}>
              <div className={className + '__section-title'}>Filters without Alerts</div>
              <div className={className + '__collection'}>
                {filtersWithoutAlerts.map((filter) => {
                  const alertData = alertSummaries.get(filter.filterName);
                  return (
                    <MonitorBox
                      key={`monitor-box-empty_${filter.filterName}`}
                      title={filter.filterName}
                      filterClause={filter.filterClause}
                      onBoxClick={() => onBoxClick(filter.filterName)}
                      shouldRefetch={false}
                      data={alertData?.data}
                      loading={alertData?.loading}
                      error={alertData?.error}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </>
      );
    }

    return (
      <>
        <div className={className + '__dropdown'}>
          <MultiSelect
            id="Filters_multiselect"
            label="Select your filters"
            titleText="Filter selection"
            items={parsedFilters}
            itemToElement={(item) =>
              <span>
                {item.filterName}
              </span>
            }
            onChange={data => onFilterSelect(data.selectedItems)}
            selectedItems={selectedFilters}
          />
        </div>
        {filtersWithAlerts.length > 0 && (
          <>
            <div className={className + '__section-title'}>Filters with Alerts</div>
            <div className={className + '__collection'}>
              {filtersWithAlerts.map((filter) => {
                const alertData = alertSummaries.get(filter.filterName);
                return (
                  <MonitorBox
                    key={`monitor-box-alerts_${filter.filterName}`}
                    title={filter.filterName}
                    filterClause={filter.filterClause}
                    onBoxClick={() => onBoxClick(filter.filterName)}
                    shouldRefetch={false}
                    data={alertData?.data}
                    loading={alertData?.loading}
                    error={alertData?.error}
                  />
                );
              })}
            </div>
          </>
        )}

        {filtersWithoutAlerts.length > 0 && (
          <div className={className + '__empty-section'}>
            <div className={className + '__section-title'}>Filters without Alerts</div>
            <div className={className + '__collection'}>
              {filtersWithoutAlerts.map((filter) => {
                const alertData = alertSummaries.get(filter.filterName);
                return (
                  <MonitorBox
                    key={`monitor-box-empty_${filter.filterName}`}
                    title={filter.filterName}
                    filterClause={filter.filterClause}
                    onBoxClick={() => onBoxClick(filter.filterName)}
                    shouldRefetch={false}
                    data={alertData?.data}
                    loading={alertData?.loading}
                    error={alertData?.error}
                  />
                );
              })}
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className={className} role='contentinfo'>
      {getBody()}
    </div>
  );
}
