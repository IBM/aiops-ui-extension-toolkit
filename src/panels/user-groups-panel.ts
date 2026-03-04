/**
 * © Copyright IBM Corp. 2022, 2025
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useQuery } from '../helpers/useQuery';
import createPanel from '../app/createPanel';
import UserGroups from '../components/user-groups/UserGroups';

const USER_GROUPS_QUERY_PARAMS = {
  tenantId: window.akoraConfig.baseState.tenantId
};

const UserGroupsPanel = () => {
  const query = useQuery('getGroups', USER_GROUPS_QUERY_PARAMS);
  return React.createElement(UserGroups, query);
};

export default createPanel(UserGroupsPanel);

// Made with Bob
