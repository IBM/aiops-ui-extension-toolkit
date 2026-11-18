/**
 * © Copyright IBM Corp. 2022, 2025
 * SPDX-License-Identifier: Apache-2.0
 */

import { AiopsBundleApiClient, UploadBundleTask, loginWithApiKey } from './lib/aiops-bundle-utils.mjs';
import fs from 'fs/promises';
import minimist from 'minimist';
import { getClient, updateRoutesConfigMap, defaultNamespace } from './lib/aiops-k8s-utils.mjs';

const targetData = await fs.readFile('./target.json');
const targetDataJSON = JSON.parse(targetData);

// Parse command-line arguments
const args = minimist(process.argv.slice(2), {
  alias: { n: 'namespace' },
  string: ['namespace'],
  default: {}
});

// if (targetDataJSON.insecure) { // currently no support for cert checking, api validation only
process.removeAllListeners('warning');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
// }

// Main deployment flow
const { authToken } = await loginWithApiKey(targetDataJSON.url, targetDataJSON.username, targetDataJSON.apiKey);
console.log('Logged into cluster and ready to upload 📡');

const bundleClient = AiopsBundleApiClient({
  url: targetDataJSON.url,
  token: authToken
});

const uploadBundleTask = UploadBundleTask(bundleClient);

console.log('Initiating bundle upload 🚀')
try {
  await uploadBundleTask.uploadBundleFromDirectory(targetDataJSON.tenantId, targetDataJSON.bundleName, 'dist' );
  console.log('Bundle uploaded successfully! 🎉')
} catch(e) {
  console.error('Bundle upload failed:', e)
  process.exit(1);
}

// Update routes ConfigMap if kubeconfig is available
console.log('\nUpdating routes configuration...');
try {
  const client = getClient();
  const namespace = args.namespace || targetDataJSON.namespace || defaultNamespace;
  const success = await updateRoutesConfigMap(client, namespace, targetDataJSON.bundleName);

  if (success) {
    console.log('\n✅ Deployment complete! Bundle and routes updated successfully.');
  } else {
    console.log('\n⚠️  Bundle uploaded but routes update failed. You may need to run enable.mjs or manually update the ConfigMap.');
  }
} catch (e) {
  if (e.toString().includes('cluster is missing')) {
    console.log('\n⚠️  No kubeconfig found. Bundle uploaded but routes not updated on cluster.');
    console.log('   Run enable.mjs with proper kubeconfig to update routes, or manually update the ConfigMap.');
  } else {
    console.error('\n⚠️  Routes update failed:', e.message || e);
    console.log('   Bundle uploaded successfully, but routes may need manual update.');
  }
}

// Made with Bob
