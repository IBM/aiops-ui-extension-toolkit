/**
 * © Copyright IBM Corp. 2026
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import type { AlertSummary } from '../components/shared/MonitorBoxTypes';

interface AlertSummaryData {
  tenant: {
    alertSummary: {
      tenantId: string;
      groupby: string[];
      summary: AlertSummary[];
    };
  };
}

interface FilterQuery {
  filterName: string;
  filterClause: string;
}

interface AlertSummaryResult {
  filterName: string;
  data?: AlertSummaryData;
  loading: boolean;
  error?: any;
  hasAlerts: boolean;
}

interface UseAlertSummariesReturn {
  results: Map<string, AlertSummaryResult>;
  loading: boolean;
  error?: any;
  refetch: () => void;
}

declare global {
  interface Window {
    akoraConfig: any;
  }
}

const TENANT_ID = 'cfd95b7e-3bc7-4006-a4a8-a73a79c71255';

/**
 * Custom hook to fetch alert summaries for multiple filters using Promise.all
 * @param filters Array of filter queries to fetch alert summaries for
 * @returns Object containing results map, loading state, error, and refetch function
 */
export function useAlertSummaries(filters: FilterQuery[]): UseAlertSummariesReturn {
  const [results, setResults] = useState<Map<string, AlertSummaryResult>>(new Map());
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>();
  const abortControllerRef = useRef<AbortController | null>(null);
  const cacheRef = useRef<Map<string, AlertSummaryResult>>(new Map());

  const fetchAlertSummaries = useCallback(async () => {
    if (!filters || filters.length === 0) {
      setResults(new Map());
      return;
    }

    // Cancel any pending requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    // Identify filters that need to be fetched (not in cache or need refresh)
    const filtersToFetch = filters.filter(filter => !cacheRef.current.has(filter.filterName));

    // Start with cached results
    const currentResults = new Map<string, AlertSummaryResult>(cacheRef.current);

    // Remove filters that are no longer selected
    const selectedFilterNames = new Set(filters.map(f => f.filterName));
    for (const [filterName] of currentResults) {
      if (!selectedFilterNames.has(filterName)) {
        currentResults.delete(filterName);
        cacheRef.current.delete(filterName);
      }
    }

    // If no new filters to fetch, just update results with cached data
    if (filtersToFetch.length === 0) {
      setResults(currentResults);
      return;
    }

    setLoading(true);
    setError(undefined);

    // Add loading state for new filters
    filtersToFetch.forEach(filter => {
      currentResults.set(filter.filterName, {
        filterName: filter.filterName,
        loading: true,
        hasAlerts: false
      });
    });
    setResults(new Map(currentResults));

    try {
      // Create promises only for filters that need to be fetched
      const promises = filtersToFetch.map(filter =>
        window.akoraConfig.baseState.API.contentAnalyticsAPI.getAlertSummary({
          tenantId: TENANT_ID,
          filter: filter.filterClause,
          groupBy: ['severity']
        })
          .then((data: AlertSummaryData): AlertSummaryResult => ({
            filterName: filter.filterName,
            data,
            loading: false,
            error: undefined,
            hasAlerts: data?.tenant?.alertSummary?.summary?.reduce(
              (acc: number, cur: AlertSummary) => acc + cur.count,
              0
            ) > 0
          }))
          .catch((err: any): AlertSummaryResult => ({
            filterName: filter.filterName,
            data: undefined,
            loading: false,
            error: err,
            hasAlerts: false
          }))
      );

      // Wait for all queries to complete
      const settledResults = await Promise.all(promises);

      // Update cache and results with new data
      settledResults.forEach(result => {
        currentResults.set(result.filterName, result);
        cacheRef.current.set(result.filterName, result);
      });

      setResults(new Map(currentResults));
      setLoading(false);
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  }, [filters]);

  const refetch = useCallback(() => {
    // Clear cache to force refetch of all current filters
    cacheRef.current.clear();
    fetchAlertSummaries();
  }, [fetchAlertSummaries]);

  useEffect(() => {
    fetchAlertSummaries();

    // Cleanup function to abort pending requests
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchAlertSummaries]);

  return {
    results,
    loading,
    error,
    refetch
  };
}

// Made with Bob
