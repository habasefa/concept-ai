/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { QuestionUpdateTool } from './question.js';
import { createMockMessageBus } from '../test-utils/mock-message-bus.js';

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

describe('Question Tools', () => {
  const messageBus = createMockMessageBus();
  const signal = new AbortController().signal;

  beforeEach(() => {
    mockEnv();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  describe('QuestionUpdateTool', () => {
    const tool = new QuestionUpdateTool(messageBus);

    it('should successfully update a question', async () => {
      const responseBody = { id: 1, question_text: 'Updated' };
      const mockFetch = mockFetchOk(responseBody);

      const result = await tool.buildAndExecute(
        { question_id: 1, question_text: 'Updated' },
        signal,
      );

      expect(mockFetch).toHaveBeenCalledOnce();
      const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(url).toBe('https://api.test.prepx.dev/agent/question/1');
      expect(options.method).toBe('PUT');
      expect(JSON.parse(options.body as string)).toEqual({
        question_text: 'Updated',
      });
      expect(result.llmContent).toBe(JSON.stringify(responseBody));
    });

    it('should handle API errors', async () => {
      mockFetchError('{"detail":"API Error"}', 400);

      const result = await tool.buildAndExecute(
        { question_id: 1, question_text: 'Updated' },
        signal,
      );

      expect(result.llmContent).toContain('API Error');
    });
  });
});
