# aiops-ui-extension-toolkit

## Overview
Dashboard extension toolkit and examples for Cloud Pak for AIOps

## Components
[Components](src/components) are the widgets that comprise your dashboard. Components must be exported as [panels](src/panels) to be used in a dashboard region. These are written in React.js, and we recommend [Carbon Design System](https://carbondesignsystem.com/) as the UI framework, although you may use any React.js compatible library.

## Data
For convenience, a [query hook](src/helpers/useQuery.ts) is provided that allows secure access to most of the issue resolution data. Of course, you're free to pull in data from other sources.

## Routes
Routes define a browser path to your dashboard within Cloud Pak for AIOps. This includes how components are organized and whether they're exposed in the Cloud Pak for AIOps main menu. An [schema](config/schemas/routes.json) is provided, as well as an [example](config/routes.json) to get started.

## Examples
Visit our [storybook](https://ibm.github.io/aiops-ui-extension-toolkit) for examples based on real Netcool customers.

You can also install the examples into an actual Cloud Pak for AIOps cluster.
For a guide on embedding a Grafana page, see the doc [here](doc/grafana-guide.md).

## Ready to start building?
See our [getting started](doc/getting-started.md) page for the step-by-step process.
