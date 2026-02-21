/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TextbookRagTool } from './rag.js';
import { createMockMessageBus } from '../test-utils/mock-message-bus.js';

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function mockEnv() {
  vi.stubEnv('PREPX_API_BASE_URL', 'https://api.test.prepx.dev');
  vi.stubEnv('PREPX_API_KEY_ID', 'test-key-id');
  vi.stubEnv('PREPX_API_SECRET', 'test-secret');
}

function mockFetchOk(body: object, status = 200) {
  const mockFetch = vi.fn().mockResolvedValue({
    ok: true,
    status,
    text: () => Promise.resolve(JSON.stringify(body)),
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

describe('TextbookRAG Tool', () => {
  const messageBus = createMockMessageBus();
  const signal = new AbortController().signal;

  beforeEach(() => {
    mockEnv();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  // -------------------------------------------------------------------------
  // TextbookRagTool
  // -------------------------------------------------------------------------
  describe('TextbookRagTool', () => {
    const tool = new TextbookRagTool(messageBus);

    it('should call POST /vector/search with correct body', async () => {
      const responseBody = {
        results: [{ text: 'Result 1', score: 0.9, metadata: {} }],
        latency_seconds: 0.1,
        count: 1,
      };
      const mockFetch = mockFetchOk(responseBody, 200);

      const result = await tool.buildAndExecute(
        {
          query: 'cell theory',
        },
        signal,
      );

      expect(mockFetch).toHaveBeenCalledOnce();
      const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(url).toBe('https://api.test.prepx.dev/vector/search');
      expect(options.method).toBe('POST');
      expect(JSON.parse(options.body as string)).toEqual({
        query: 'cell theory',
        limit: 10,
        score_threshold: 0.5,
      });
      expect(result.llmContent).toBe(JSON.stringify(responseBody));
    });

    it('should include HMAC auth headers', async () => {
      mockFetchOk({ results: [] }, 200);

      await tool.buildAndExecute({ query: 'auth test' }, signal);
      const headers = (
        vi.mocked(fetch).mock.calls[0] as [string, RequestInit]
      )[1].headers as Record<string, string>;

      expect(headers['X-Api-Key-Id']).toBe('test-key-id');
      expect(headers['X-Api-Timestamp']).toBeDefined();
      expect(headers['Authorization']).toMatch(/^HMAC /);
      expect(headers['Content-Type']).toBe('application/json');
    });

    it('should return error on API failure', async () => {
      mockFetchError('{"detail":"Service Unavailable"}', 503);

      const result = await tool.buildAndExecute({ query: 'bad' }, signal);

      expect(result.llmContent).toBe(
        'Error 503: {"detail":"Service Unavailable"}',
      );
    });

    it('should throw when env vars are missing', async () => {
      vi.stubEnv('PREPX_API_BASE_URL', '');

      await expect(
        tool.buildAndExecute({ query: 'test' }, signal),
      ).rejects.toThrow('Missing PREPX_API_BASE_URL');
    });
  });
});
