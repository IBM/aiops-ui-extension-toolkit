/**
 * © Copyright IBM Corp. 2022, 2025
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState, useEffect } from 'react';
import { Dropdown } from '@carbon/react';

import './user-groups.scss';

// @ts-ignore
import getReactRenderer from '@ibm/akora-renderer-react';
import ReactDOM from 'react-dom/client';

const ReactRenderer = getReactRenderer(React, ReactDOM);
const { useAkoraState, setUrlParameters } = ReactRenderer.components;

const className = 'user-groups';

type User = {
  id: string;
}

type Group = {
  id: string;
  description?: string;
  users: User[];
}

const UserGroups = (props: any) => {
  const {
    data,
    loading,
  } = props;

  const { state, app } = useAkoraState();
  const targetUrl = app.resolvePathExpression(state.path);
  const { title } = app.getStateForPath(targetUrl);

  const groups = data?.tenant?.groups || [];
  const currentUserId = state?.user?.id;

  // Get the usergroupname from URL query parameters
  // Use state.resolvedFullPath or state.fullPath to ensure we get the latest URL
  const currentPath = state?.resolvedFullPath || state?.fullPath || '';
  const urlParams = new URLSearchParams(currentPath.split('?')[1] || '');
  const usergroupParam = urlParams.get('usergroupname');

  const groupItems = useMemo(() => {
    // Filter groups to only include those where the current user is a member
    const userGroups = groups.filter((group: Group) =>
      group.users && group.users.some((user: User) => user.id === currentUserId)
    );

    // Map to dropdown items using id as both id and label
    return userGroups.map((group: Group) => ({
      id: group.id,
      label: group.id
    }));
  }, [groups, currentUserId]);

  // Use local state to manage the selected item
  const [selectedItem, setSelectedItem] = useState<any>(undefined);

  // Sync selectedItem with URL parameter
  useEffect(() => {
    if (usergroupParam && groupItems.length > 0) {
      const item = groupItems.find((item: any) => item.id === usergroupParam);
      setSelectedItem(item);
    } else {
      setSelectedItem(undefined);
    }
  }, [usergroupParam, groupItems]);

  const handleGroupChange = (e: any) => {
    const selectedGroup = e.selectedItem;

    // Update local state immediately for responsive UI
    setSelectedItem(selectedGroup);

    // Update URL parameters with the selected group
    if (selectedGroup && selectedGroup.id) {
      const newRoute = setUrlParameters(state?.resolvedFullPath || state?.fullPath, {
        usergroupname: selectedGroup.id
      });
      app.replaceRoute(newRoute);
    }
  };

  return (
    <div className={className} role='contentinfo'>
      <div className={`${className}__container`}>
        <Dropdown
          id='user-groups-dropdown'
          titleText='User Groups'
          label={loading ? 'Loading groups...' : 'Select a group'}
          items={groupItems}
          itemToString={(item: any) => item?.label || ''}
          selectedItem={selectedItem}
          onChange={handleGroupChange}
          disabled={loading}
        />
      </div>
    </div>
  );
};

export default UserGroups;

// Made with Bob
