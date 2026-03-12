# MonitorBoxCollection Component

A React component that displays a collection of monitor boxes showing alert summaries for different filters. The component can operate in two modes: displaying all available filters automatically, or allowing users to select specific filters via a multi-select dropdown.

## Overview

The MonitorBoxCollection component fetches alert filters and their corresponding alert summaries, then displays them as interactive monitor boxes. Each monitor box shows the alert count by severity for a specific filter. Clicking on a monitor box can either navigate to the alert list in the current window or open it in a new window.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `useAllFilters` | `boolean` | `false` | When `true`, automatically displays all available filters. When `false`, shows a multi-select dropdown allowing users to choose which filters to display. |
| `openNewAlertListOnClick` | `boolean` | `false` | When `true`, clicking a monitor box opens the alert list in a new browser window. When `false`, navigates to the alert list in the current window. |

## Features

- **Automatic Filter Loading**: Fetches all alert filters from the system
- **Alert Summary Display**: Shows alert counts grouped by severity for each filter
- **Two Display Modes**:
  - **All Filters Mode** (`useAllFilters: true`): Automatically displays all filters
  - **Selective Mode** (`useAllFilters: false`): Provides a multi-select dropdown to choose filters
- **Smart Grouping**: Separates filters into "Filters with Alerts" and "Filters without Alerts" sections
- **Auto-refresh**: Automatically refreshes alert summaries every 60 seconds
- **Click Behavior**: Configurable navigation behavior (same window vs. new window)
- **Loading States**: Shows loading indicators while fetching data
- **Error Handling**: Displays error notifications with retry functionality

## Usage in Routes Configuration

Add the MonitorBoxCollection component to your `routes.json` file:

```json
{
  "path": "/monitor-boxes",
  "regions": {
    "right": {
      "aiopsPanel": "alertViewer"
    },
    "left": {
      "bundlePath": "bundles/alerts-examples/files/alerts-examples-bundle.js",
      "panelId": "monitor-boxes",
      "state": {
        "useAllFilters": true,
        "openNewAlertListOnClick": false
      }
    }
  },
  "title": "Monitor boxes"
}
```

### Configuration Examples

#### Example 1: Display All Filters with Same-Window Navigation (Default)
```json
{
  "path": "/monitor-boxes-all",
  "regions": {
    "left": {
      "bundlePath": "bundles/alerts-examples/files/alerts-examples-bundle.js",
      "panelId": "monitor-boxes",
      "state": {
        "useAllFilters": true,
        "openNewAlertListOnClick": false
      }
    },
    "right": {
      "aiopsPanel": "alertViewer"
    }
  },
  "title": "All Monitor Boxes"
}
```

#### Example 2: User-Selected Filters with New-Window Navigation
```json
{
  "path": "/monitor-boxes-select",
  "regions": {
    "left": {
      "bundlePath": "bundles/alerts-examples/files/alerts-examples-bundle.js",
      "panelId": "monitor-boxes",
      "state": {
        "useAllFilters": false,
        "openNewAlertListOnClick": true
      }
    },
    "right": {
      "aiopsPanel": "alertViewer"
    }
  },
  "title": "Select Monitor Boxes"
}
```

#### Example 3: Full-Width Display with All Filters
```json
{
  "path": "/monitor-boxes-full",
  "regions": {
    "top": {
      "bundlePath": "bundles/alerts-examples/files/alerts-examples-bundle.js",
      "panelId": "monitor-boxes",
      "state": {
        "useAllFilters": true,
        "openNewAlertListOnClick": false
      }
    }
  },
  "title": "Monitor Boxes Dashboard"
}
```

## Component Behavior

### Display Modes

#### All Filters Mode (`useAllFilters: true`)
- Automatically fetches and displays all available alert filters
- No user interaction required to see filters
- Filters are organized into two sections:
  - **Filters with Alerts**: Filters that have active alerts
  - **Filters without Alerts**: Filters with no current alerts
- Ideal for dashboard views where you want to see all monitoring data at once

#### Selective Mode (`useAllFilters: false`)
- Displays a multi-select dropdown at the top
- Users can choose which filters to display
- Only selected filters are shown
- Filters are still organized into sections based on alert presence
- Ideal for focused monitoring where users want to track specific filters

### Click Behavior

#### Same Window Navigation (`openNewAlertListOnClick: false`)
- Clicking a monitor box updates the URL with the filter name
- Navigates to the alert list in the current window
- Maintains the current page context
- Best for integrated dashboard views

#### New Window Navigation (`openNewAlertListOnClick: true`)
- Clicking a monitor box opens the alert list in a new browser window/tab
- Preserves the current dashboard view
- Allows users to investigate alerts without losing their place
- Best for multi-tasking scenarios

## Data Flow

1. Component mounts and fetches all alert filters
2. Filters are parsed and stored in state
3. Based on `useAllFilters` prop:
   - If `true`: All filters are used for alert summary queries
   - If `false`: Only user-selected filters are used
4. Alert summaries are fetched for the relevant filters
5. Results are grouped into "with alerts" and "without alerts" sections
6. Auto-refresh updates summaries every 60 seconds
7. User clicks trigger navigation based on `openNewAlertListOnClick` prop

## Dependencies (already included by default)

- `@carbon/react`: For UI components (MultiSelect, Loading, ActionableNotification)
- `@ibm/akora-renderer-react`: For Akora state management and routing
- Custom hooks:
  - `useQuery`: For fetching alert filters
  - `useAlertSummaries`: For fetching alert summary data

## Styling

The component uses SCSS modules located in `monitor-box-collection.scss`. Key CSS classes:
- `.monitor-boxes`: Main container
- `.monitor-boxes__dropdown`: Filter selection dropdown
- `.monitor-boxes__collection`: Grid layout for monitor boxes
- `.monitor-boxes__section-title`: Section headers
- `.monitor-boxes__empty-section`: Container for filters without alerts

## Related Components

- **MonitorBox**: Individual monitor box component that displays alert summary for a single filter
- **AlertViewer**: AIOps panel that displays the full alert list (typically used in the right region)