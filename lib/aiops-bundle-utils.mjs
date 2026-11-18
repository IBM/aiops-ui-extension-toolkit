/**
 * © Copyright IBM Corp. 2022, 2026
 * SPDX-License-Identifier: Apache-2.0
 *
 * Utilities for authenticating, packaging, and deploying UI extension bundles to Cloud Pak for AIOps.
 */

import fs from 'fs/promises';
import { createReadStream } from 'fs';
import path from 'path';
import JSZip from 'jszip';

/**
 * Recursively find all file paths in a directory.
 * @param {string} dirPath - Directory path to traverse
 * @returns {Promise<string[]>} List of absolute file paths
 */
async function getDirFilePaths(dirPath) {
  let allPaths = [];
  const subPaths = await fs.readdir(dirPath);

  for (const subPath of subPaths) {
    const absSubPath = path.resolve(dirPath, subPath);
    const fileInfo = await fs.stat(absSubPath);

    if (fileInfo && fileInfo.isDirectory()) {
      allPaths = allPaths.concat(await getDirFilePaths(absSubPath));
    } else {
      allPaths.push(absSubPath);
    }
  }

  return allPaths;
}

/**
 * Compresses all files under a directory recursively into a zip buffer.
 *
 * @param {string} dirPath - Path to the directory to compress
 * @returns {Promise<Buffer>} A Node buffer containing the compressed zip
 */
export async function directoryToZipBuffer(dirPath) {
  const absDirPath = path.resolve(dirPath);
  const zipFile = new JSZip();
  const dirFilePaths = await getDirFilePaths(dirPath);

  for (const filePath of dirFilePaths) {
    const relativePath = path.relative(absDirPath, filePath);
    zipFile.file(relativePath, createReadStream(filePath));
  }

  return await zipFile.generateAsync({ type: 'nodebuffer' });
}

/**
 * Log in to Cloud Pak / Zen platform using an API key.
 *
 * @param {string} url - Base URL of the Cloud Pak cluster (e.g. https://cpd-aiops.apps.example.com)
 * @param {string} username - Zen username
 * @param {string} apiKey - Zen platform API key
 * @returns {Promise<{ authToken: string, zenUrl: string }>}
 */
export async function loginWithApiKey(url, username, apiKey) {
  const authUrl = new URL('/icp4d-api/v1/authorize', url).href;

  const response = await fetch(authUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username,
      api_key: apiKey
    })
  });

  if (response.ok) {
    const data = await response.json();
    return {
      authToken: data.token,
      zenUrl: url
    };
  }

  let errorDetails = '';
  try {
    const errJson = await response.json();
    errorDetails = errJson.message || JSON.stringify(errJson);
  } catch {
    errorDetails = await response.text();
  }

  if (response.status === 400) {
    throw new Error(`Invalid request during login: ${errorDetails}`);
  } else if (response.status === 401 || response.status === 403) {
    throw new Error(`Received unauthorized response during login. Validate your credentials and permissions: ${errorDetails}`);
  } else {
    throw new Error(`API error during login (${response.status}): ${errorDetails}`);
  }
}

/**
 * Create an AIOps Bundle API client
 *
 * @param {{ url: string, token: string }} config
 */
export function AiopsBundleApiClient(config) {
  return {
    /**
     * Upload a zipped bundle to the AIOps bundle API
     *
     * @param {string} tenantId - Tenant ID
     * @param {string} bundleId - Bundle name / identifier
     * @param {Buffer} zipFile - Zipped bundle file buffer
     * @returns {Promise<any>}
     */
    async uploadBundle(tenantId, bundleId, zipFile) {
      const uploadUrl = new URL(`/aiops/${encodeURIComponent(tenantId)}/bundles`, config.url).href;

      const formData = new FormData();
      const blob = new Blob([zipFile], { type: 'application/zip' });
      formData.append('files', blob, 'bundle.zip');
      formData.append('bundleId', bundleId);

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `bearer ${config.token}`
        }
      });

      if (response.ok) {
        return await response.json();
      }

      let errorDetails = '';
      try {
        const errJson = await response.json();
        errorDetails = errJson.message || JSON.stringify(errJson);
      } catch {
        errorDetails = await response.text();
      }

      if (response.status === 400) {
        throw new Error(`Invalid request during bundle upload. Verify your zip file is valid: ${errorDetails}`);
      } else if (response.status === 401 || response.status === 403) {
        throw new Error(`Received unauthorized response during bundle upload: ${errorDetails}`);
      } else {
        throw new Error(`Error returned from bundle API (${response.status}): ${errorDetails}`);
      }
    }
  };
}

/**
 * Create an Upload Bundle Task
 *
 * @param {{ uploadBundle: (tenantId: string, bundleId: string, zipFile: Buffer) => Promise<any> }} client
 */
export function UploadBundleTask(client) {
  return {
    /**
     * Zip a directory and upload it as a bundle
     *
     * @param {string} tenantId - Tenant ID
     * @param {string} bundleId - Bundle name / identifier
     * @param {string} directoryPath - Directory containing the bundle files (e.g. 'dist')
     * @returns {Promise<any>}
     */
    async uploadBundleFromDirectory(tenantId, bundleId, directoryPath) {
      const zipFile = await directoryToZipBuffer(directoryPath);
      return await client.uploadBundle(tenantId, bundleId, zipFile);
    }
  };
}

/**
 * Convenience helper to upload a directory as a bundle directly
 *
 * @param {{ url: string, token: string }} config
 * @param {string} tenantId
 * @param {string} bundleId
 * @param {string} directoryPath
 * @returns {Promise<any>}
 */
export async function uploadBundleFromDirectory(config, tenantId, bundleId, directoryPath) {
  const client = AiopsBundleApiClient(config);
  const task = UploadBundleTask(client);
  return await task.uploadBundleFromDirectory(tenantId, bundleId, directoryPath);
}
