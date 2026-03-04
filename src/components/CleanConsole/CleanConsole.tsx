/**
 * © Copyright IBM Corp. 2025
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import './CleanConsole.scss';

interface StatusData {
  count: number;
  maxSeverity: number;
}

interface ServiceStatus {
  name: string;
  new: StatusData;
  ack: StatusData;
  wait: StatusData;
  maint: StatusData;
  auto: StatusData;
}

interface CleanConsoleProps {
  title?: string;
  services?: ServiceStatus[];
  aiopsAlertsUrl?: string;
  aiopsAlertsView?: string;
}

const CleanConsole: React.FC<CleanConsoleProps> = ({
  title = 'APSRE CleanConsole',
  services = [],
  aiopsAlertsUrl = '',
  aiopsAlertsView = ''
}) => {
  // Define location categories (for determining category type prefix)
  const LOCATION_CATEGORIES = new Set(['TX', 'VA', 'PA', 'AZ', 'GLOBAL', 'Unknown']);
  // Default service data from sampleData.txt
  const defaultServices: ServiceStatus[] = [
    { name: 'TX', new: { count: 39, maxSeverity: 6 }, ack: { count: 0, maxSeverity: 0 }, wait: { count: 20, maxSeverity: 6 }, maint: { count: 24, maxSeverity: 6 }, auto: { count: 17, maxSeverity: 5 } },
    { name: 'VA', new: { count: 52, maxSeverity: 6 }, ack: { count: 0, maxSeverity: 0 }, wait: { count: 26, maxSeverity: 6 }, maint: { count: 24, maxSeverity: 6 }, auto: { count: 25, maxSeverity: 6 } },
    { name: 'PA', new: { count: 48, maxSeverity: 6 }, ack: { count: 0, maxSeverity: 0 }, wait: { count: 25, maxSeverity: 6 }, maint: { count: 25, maxSeverity: 6 }, auto: { count: 25, maxSeverity: 6 } },
    { name: 'AZ', new: { count: 29, maxSeverity: 6 }, ack: { count: 0, maxSeverity: 0 }, wait: { count: 13, maxSeverity: 6 }, maint: { count: 17, maxSeverity: 6 }, auto: { count: 16, maxSeverity: 6 } },
    { name: 'GLOBAL', new: { count: 43, maxSeverity: 6 }, ack: { count: 0, maxSeverity: 0 }, wait: { count: 20, maxSeverity: 6 }, maint: { count: 23, maxSeverity: 6 }, auto: { count: 18, maxSeverity: 6 } },
    { name: 'Integration Services', new: { count: 10, maxSeverity: 6 }, ack: { count: 0, maxSeverity: 0 }, wait: { count: 2, maxSeverity: 2 }, maint: { count: 4, maxSeverity: 3 }, auto: { count: 6, maxSeverity: 4 } },
    { name: 'Card', new: { count: 7, maxSeverity: 6 }, ack: { count: 0, maxSeverity: 0 }, wait: { count: 4, maxSeverity: 6 }, maint: { count: 4, maxSeverity: 4 }, auto: { count: 3, maxSeverity: 4 } },
    { name: 'Deposits', new: { count: 11, maxSeverity: 6 }, ack: { count: 0, maxSeverity: 0 }, wait: { count: 7, maxSeverity: 6 }, maint: { count: 6, maxSeverity: 6 }, auto: { count: 7, maxSeverity: 5 } },
    { name: 'GWIM', new: { count: 10, maxSeverity: 6 }, ack: { count: 0, maxSeverity: 0 }, wait: { count: 6, maxSeverity: 6 }, maint: { count: 6, maxSeverity: 6 }, auto: { count: 5, maxSeverity: 6 } },
    { name: 'Batch', new: { count: 12, maxSeverity: 5 }, ack: { count: 0, maxSeverity: 0 }, wait: { count: 8, maxSeverity: 5 }, maint: { count: 5, maxSeverity: 4 }, auto: { count: 4, maxSeverity: 5 } },
    { name: 'Mortgage', new: { count: 12, maxSeverity: 5 }, ack: { count: 0, maxSeverity: 0 }, wait: { count: 4, maxSeverity: 5 }, maint: { count: 5, maxSeverity: 5 }, auto: { count: 7, maxSeverity: 5 } },
    { name: 'CVL', new: { count: 11, maxSeverity: 6 }, ack: { count: 0, maxSeverity: 0 }, wait: { count: 4, maxSeverity: 6 }, maint: { count: 7, maxSeverity: 6 }, auto: { count: 8, maxSeverity: 6 } },
    { name: 'Other', new: { count: 5, maxSeverity: 3 }, ack: { count: 0, maxSeverity: 0 }, wait: { count: 2, maxSeverity: 3 }, maint: { count: 3, maxSeverity: 3 }, auto: { count: 3, maxSeverity: 3 } },
    { name: 'All', new: { count: 211, maxSeverity: 6 }, ack: { count: 0, maxSeverity: 0 }, wait: { count: 104, maxSeverity: 6 }, maint: { count: 113, maxSeverity: 6 }, auto: { count: 101, maxSeverity: 6 } }
  ];

  const displayServices = services.length > 0 ? services : defaultServices;

  const getSeverityColor = (severity: number): string => {
    switch (severity) {
      case 6: return '#DA1E28'; // Critical
      case 5: return '#FC7B1E'; // Major
      case 4: return '#FDD13A'; // Minor
      case 3: return '#408BFC'; // Warning
      case 2: return '#3f71b2'; // Information
      case 1: return '#B23AEE'; // Indeterminate
      case 0:
      default: return '#3cc82dff'; // No alerts/Clear
    }
  };

  const handleBlobClick = (category: string) => {
    if (aiopsAlertsUrl && aiopsAlertsUrl.trim() !== '') {
      // Determine filtername based on category type
      let filtername: string;
      if (category === 'All') {
        filtername = 'All Alerts';
      } else if (LOCATION_CATEGORIES.has(category)) {
        filtername = `L ${category}`;
      } else {
        // Service category
        filtername = `S ${category}`;
      }

      // Construct URL with filtername parameter
      let url = `${aiopsAlertsUrl}?filtername=${encodeURIComponent(filtername)}`;
      if (aiopsAlertsView) {
        url += `&viewname=${encodeURIComponent(aiopsAlertsView)}`;
      }
      window.open(url, '_blank');
    }
  };

  const renderStatusIndicator = (statusData: StatusData, category: string) => {
    const color = getSeverityColor(statusData.count === 0 ? 0 : statusData.maxSeverity);

    return (
      <div
        className="clean-console__status-indicator"
        style={{ backgroundColor: color }}
        onClick={() => handleBlobClick(category)}
      >
        <span className="clean-console__status-count">{statusData.count}</span>
      </div>
    );
  };

  return (
    <div className="clean-console">
      <div className="clean-console__header">
        <h2 className="clean-console__title">{title}</h2>
      </div>

      <div className="clean-console__content">
        <div className="clean-console__main">
          <div className="clean-console__status-tabs">
            <div className="clean-console__status-tab clean-console__status-tab--blank"></div>
            <div className="clean-console__status-tab">New</div>
            <div className="clean-console__status-tab">Ack</div>
            <div className="clean-console__status-tab">Wait</div>
            <div className="clean-console__status-tab">Maint</div>
            <div className="clean-console__status-tab">Auto</div>
          </div>

          <div className="clean-console__grid">
            <div className="clean-console__table">
              {displayServices.map((service, index) => (
                <div key={index} className="clean-console__table-row">
                  <div className="clean-console__table-cell clean-console__table-cell--service">
                    {service.name}
                  </div>
                  <div className="clean-console__table-cell clean-console__table-cell--status">
                    {renderStatusIndicator(service.new, service.name)}
                  </div>
                  <div className="clean-console__table-cell clean-console__table-cell--status">
                    {renderStatusIndicator(service.ack, service.name)}
                  </div>
                  <div className="clean-console__table-cell clean-console__table-cell--status">
                    {renderStatusIndicator(service.wait, service.name)}
                  </div>
                  <div className="clean-console__table-cell clean-console__table-cell--status">
                    {renderStatusIndicator(service.maint, service.name)}
                  </div>
                  <div className="clean-console__table-cell clean-console__table-cell--status">
                    {renderStatusIndicator(service.auto, service.name)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="clean-console__legend">
          <h3 className="clean-console__legend-title">Severity</h3>
          <div className="clean-console__legend-items">
            <div className="clean-console__legend-item">
              <div className="clean-console__legend-indicator" style={{ backgroundColor: '#DA1E28' }}></div>
              <span>Critical</span>
            </div>
            <div className="clean-console__legend-item">
              <div className="clean-console__legend-indicator" style={{ backgroundColor: '#FC7B1E' }}></div>
              <span>Major</span>
            </div>
            <div className="clean-console__legend-item">
              <div className="clean-console__legend-indicator" style={{ backgroundColor: '#FDD13A' }}></div>
              <span>Minor</span>
            </div>
            <div className="clean-console__legend-item">
              <div className="clean-console__legend-indicator" style={{ backgroundColor: '#408BFC' }}></div>
              <span>Warning</span>
            </div>
            <div className="clean-console__legend-item">
              <div className="clean-console__legend-indicator" style={{ backgroundColor: '#3f71b2' }}></div>
              <span>Information</span>
            </div>
            <div className="clean-console__legend-item">
              <div className="clean-console__legend-indicator" style={{ backgroundColor: '#B23AEE' }}></div>
              <span>Indeterminate</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CleanConsole;