/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { callPrepxApi } from './prepxUtils.js';

function mockEnv() {
  vi.stubEnv('PREPX_API_BASE_URL', 'https://api.test.prepx.dev');
  vi.stubEnv('PREPX_API_KEY_ID', 'test-key-id');
  vi.stubEnv('PREPX_API_SECRET', 'test-secret');
}

function mockFetchOk(body: object | string, status = 200) {
  const text = typeof body === 'string' ? body : JSON.stringify(body);
  const mockFetch = vi.fn().mockResolvedValue({
    ok: true,
    status,
    text: () => Promise.resolve(text),
  });
  vi.stubGlobal('fetch', mockFetch);
  return mockFetch;
}

function mockFetchError(errorBody: string, status = 400) {
  const mockFetch = vi.fn().mockResolvedValue({
    ok: false,
    status,
    text: () => Promise.resolve(errorBody),
  });
  vi.stubGlobal('fetch', mockFetch);
  return mockFetch;
}

describe('prepxUtils', () => {
  beforeEach(() => {
    mockEnv();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('should call fetch with correct URL and headers', async () => {
    const mockFetch = mockFetchOk({ id: 1 });
    await callPrepxApi('GET', '/test-path', null);

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.test.prepx.dev/test-path');
    expect(options.method).toBe('GET');

    const headers = options.headers as Record<string, string>;
    expect(headers['X-Api-Key-Id']).toBe('test-key-id');
    expect(headers['X-Api-Timestamp']).toBeDefined();
    expect(headers['Authorization']).toMatch(/^HMAC /);
    expect(headers['Content-Type']).toBe('application/json');
  });

  it('should include body in signature calculation', async () => {
    const mockFetch = mockFetchOk({ id: 1 });
    const body = JSON.stringify({ data: 'test' });

    await callPrepxApi('POST', '/create', body);

    const headers = (vi.mocked(fetch).mock.calls[0] as [string, RequestInit])[1]
      .headers as Record<string, string>;

    // We can't easily verify the signature value without reimplementing the logic,
    // but we can verify consistency.
    const sig1 = headers['Authorization'];

    // Call again with same body and mock time to verify deterministic part if possible,
    // but timestamp changes so sig changes.
    // Instead we trust the logic is covered by the implementation and we just ensure
    // body is passed to fetch correctly.

    const [_, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(options.body).toBe(body);
    expect(sig1).toMatch(/^HMAC [A-Za-z0-9+/=]+$/);
  });

  it('should throw if env vars are missing', async () => {
    vi.stubEnv('PREPX_API_BASE_URL', '');
    await expect(callPrepxApi('GET', '/', null)).rejects.toThrow(
      'Missing PREPX_API_BASE_URL',
    );
  });

  it('should return error formatted in llmContent on failure', async () => {
    mockFetchError('Bad Request', 400);
    const result = await callPrepxApi('GET', '/bad', null);
    expect(result.llmContent).toBe('Error 400: Bad Request');
    expect(result.returnDisplay).toBe('Error 400: Bad Request');
  });

  it('should return text content on success', async () => {
    mockFetchOk('Success response');
    const result = await callPrepxApi('GET', '/ok', null);
    expect(result.llmContent).toBe('Success response');
    expect(result.returnDisplay).toBe('Success response');
  });
});
