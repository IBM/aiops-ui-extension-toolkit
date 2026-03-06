/**
 * © Copyright IBM Corp. 2025
 * SPDX-License-Identifier: Apache-2.0
 */
import { ConditionSet } from './utils/filterUtils';

interface QueryResponse {
  data: {
    tenant: AlertFilters | AlertSummaryContainer
  };
  loading: boolean;
  error: object;
  refetch: Function;
}

interface AlertFilters {
  filters: AlertFilter[];
}

interface AlertFilter {
  id: string,
  description: string,
  type: string,
  subType: null,
  mode: string,
  tags: string[],
  whereClause: string,
  name: string;
  conditionSet: ConditionSet;
}

interface AlertFilterParsed {
  filterName: string,
  filterClause: string
}

interface AlertSummaryContainer {
  alertSummary: {
    tenantId: string,
    groupby: string[],
    summary: AlertSummary[]
  }
}

interface AlertSummary {
  severity: number,
  count: number
}

interface MonitorBoxInterface {
  title: string,
  filterClause: string,
  monitorBoxData?: object,
  monitorBoxOptions?: object,
  onBoxClick: () => void,
  shouldRefetch: boolean,
  // Optional pre-fetched data to avoid redundant queries
  data?: any,
  loading?: boolean,
  error?: any
}

export type {
  QueryResponse,
  AlertFilters,
  AlertFilter,
  AlertFilterParsed,
  AlertSummaryContainer,
  AlertSummary,
  MonitorBoxInterface
}
