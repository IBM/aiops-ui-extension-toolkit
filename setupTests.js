/**
 * © Copyright IBM Corp. 2022, 2025
 * SPDX-License-Identifier: Apache-2.0
 */

import '@testing-library/jest-dom';

global.window.akoraConfig = {
  baseState: {
    clientConfiguration: {
      publicurl: 'https://someurl.com'
    },
    API: {
      contentAnalyticsAPI: {
        getAlerts: () => Promise.resolve({ tenant: { alerts: { rows: [] } } }),
        getStories: () => Promise.resolve({ tenant: { stories: { rows: [] } } }),
        getAlertSummary: () => Promise.resolve({ tenant: { alertSummary: { summary: [] } } })
      }
    }
  }
};

global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));

if (typeof window !== 'undefined' && window.SVGElement) {
  // @ts-ignore
  window.SVGElement.prototype.getComputedTextLength = () => 100;
  // @ts-ignore
  window.SVGElement.prototype.getBBox = () => ({ x: 0, y: 0, width: 100, height: 20 });
  Object.defineProperty(window.SVGElement.prototype, 'className', {
    get() {
      const cls = this.getAttribute('class') || '';
      return {
        baseVal: cls,
        animVal: cls,
        toString() {
          return cls;
        }
      };
    },
    set(value) {
      this.setAttribute('class', typeof value === 'string' ? value : value?.baseVal || '');
    }
  });
}
