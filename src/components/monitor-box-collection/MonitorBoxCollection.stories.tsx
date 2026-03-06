/**
 * © Copyright IBM Corp. 2025
 * SPDX-License-Identifier: Apache-2.0
 */
import { Meta, StoryObj } from '@storybook/react';
import { useQuery } from '#src/helpers/useQuery.mock';
import MonitorBoxCollection from './MonitorBoxCollection';
import type { QueryResponse } from '../shared/monitor-box/MonitorBoxTypes';

const meta: Meta<typeof MonitorBoxCollection> = {
  component: MonitorBoxCollection,
};
export default meta;

type Story = StoryObj<typeof MonitorBoxCollection>;

const mockAlertFilterResponse: QueryResponse = {
  data: {
    tenant: {
      filters: [ // Some filter fields omitted
        {
          id: '17168f01-9fc4-477c-a2c3-bedf59f58317',
          name: 'All alerts',
          description: 'Example filter showing all alerts',
          type: 'alert',
          subType: null,
          mode: 'basic',
          tags: [],
          conditionSet: {
            operator: 'and',
            conditions: []
          },
          whereClause: ''
        }
      ]
    }
  },
  loading: false,
  error: null,
  refetch: () => {}
}

const mockAlertSummaryResponse: QueryResponse = {
  data: {
    tenant: {
      alertSummary: {
        tenantId: 'cfd95b7e-3bc7-4006-a4a8-a73a79c71255',
        groupby: [
          'severity'
        ],
        summary: [
          {
            severity: 2,
            count: 1
          },
          {
            severity: 1,
            count: 1
          },
          {
            severity: 4,
            count: 4
          },
          {
            severity: 6,
            count: 1
          },
          {
            severity: 5,
            count: 1
          },
          {
            severity: 3,
            count: 3
          }
        ]
      }
    }
  },
  loading: false,
  error: null,
  refetch: () => {}
}

export const Default: Story = {
  async beforeEach() {
    useQuery.mockImplementation(input => {
      switch (input) {
        case 'getFilters':
          return mockAlertFilterResponse;
        case 'getAlertSummary':
          return mockAlertSummaryResponse;
        default:
          console.log('Invalid query name');
          return null;
      }
    });
  },
};
