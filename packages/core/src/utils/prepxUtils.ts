/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as crypto from 'node:crypto';
import type { ToolResult } from '../tools/tools.js';

// ---------------------------------------------------------------------------
// HMAC Auth Helper
// ---------------------------------------------------------------------------

function getAuthEnv(): { apiUrl: string; keyId: string; secret: string } {
  const apiUrl = process.env['PREPX_API_URL'];
  const keyId = process.env['PREPX_API_KEY_ID'];
  const secret = process.env['PREPX_API_SECRET'];
  if (!apiUrl || !keyId || !secret) {
    throw new Error(
      'Missing PREPX_API_URL, PREPX_API_KEY_ID, or PREPX_API_SECRET environment variable.',
    );
  }
  return { apiUrl, keyId, secret };
}

function signRequest(
  method: string,
  path: string,
  body: string,
  keyId: string,
  secret: string,
): Record<string, string> {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const bodyHash = crypto.createHash('sha256').update(body).digest('hex');
  const canonical = `${method}\n${path}\n${bodyHash}\n${timestamp}\n${keyId}`;
  const sig = crypto
    .createHmac('sha256', secret)
    .update(canonical)
    .digest('base64');

  return {
    'X-Api-Key-Id': keyId,
    'X-Api-Timestamp': timestamp,
    Authorization: `HMAC ${sig}`,
    'Content-Type': 'application/json',
  };
}

// ---------------------------------------------------------------------------
// Shared API call helper
// ---------------------------------------------------------------------------

export async function callPrepxApi(
  method: string,
  path: string,
  body: string | null,
): Promise<ToolResult> {
  const { apiUrl, keyId, secret } = getAuthEnv();
  const bodyStr = body ?? '';
  const headers = signRequest(method, path, bodyStr, keyId, secret);
  const url = `${apiUrl}${path}`;

  const resp = await fetch(url, {
    method,
    headers,
    ...(body ? { body: bodyStr } : {}),
  });

  const text = await resp.text();

  if (!resp.ok) {
    return {
      llmContent: `Error ${resp.status}: ${text}`,
      returnDisplay: `Error ${resp.status}: ${text}`,
    };
  }

  return {
    llmContent: text,
    returnDisplay: text,
  };
}
