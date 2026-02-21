/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NoteCreateTool, NoteUpdateTool, NoteGetTool } from './note.js';
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

describe('Note Tools', () => {
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
  // NoteCreateTool
  // -------------------------------------------------------------------------
  describe('NoteCreateTool', () => {
    const tool = new NoteCreateTool(messageBus);

    it('should call POST /agent/notes with correct body', async () => {
      const responseBody = { id: 42, status: 'published', title: 'Test Note' };
      const mockFetch = mockFetchOk(responseBody, 201);

      const result = await tool.buildAndExecute(
        {
          note: 'This is a test note.',
          group_ids: [1, 2],
          title: 'Test Note',
          topic_id: 10,
        },
        signal,
      );

      expect(mockFetch).toHaveBeenCalledOnce();
      const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(url).toBe('https://api.test.prepx.dev/agent/notes');
      expect(options.method).toBe('POST');
      expect(JSON.parse(options.body as string)).toEqual({
        note: 'This is a test note.',
        group_ids: [1, 2],
        title: 'Test Note',
        topic_id: 10,
      });
      expect(result.llmContent).toBe(JSON.stringify(responseBody));
    });

    it('should send only required fields when optional fields omitted', async () => {
      const responseBody = { id: 43 };
      const mockFetch = mockFetchOk(responseBody);

      await tool.buildAndExecute(
        { note: 'Minimal note', topic_id: 1, title: 'Min' },
        signal,
      );

      const body = JSON.parse(
        (mockFetch.mock.calls[0] as [string, RequestInit])[1].body as string,
      );
      expect(body).toEqual({ note: 'Minimal note', topic_id: 1, title: 'Min' });
      expect(body).not.toHaveProperty('image_url');
      expect(body).not.toHaveProperty('group_ids');
    });

    it('should include HMAC auth headers', async () => {
      mockFetchOk({ id: 1 });

      await tool.buildAndExecute(
        { note: 'auth test', topic_id: 1, title: 'Auth' },
        signal,
      );
      const headers = (
        vi.mocked(fetch).mock.calls[0] as [string, RequestInit]
      )[1].headers as Record<string, string>;
      expect(headers['X-Api-Key-Id']).toBe('test-key-id');
      expect(headers['X-Api-Timestamp']).toBeDefined();
      expect(headers['Authorization']).toMatch(/^HMAC /);
      expect(headers['Content-Type']).toBe('application/json');
    });

    it('should return error on API failure', async () => {
      mockFetchError('{"detail":"Validation error"}', 422);

      const result = await tool.buildAndExecute(
        { note: 'bad', topic_id: 1, title: 'Bad' },
        signal,
      );

      expect(result.llmContent).toBe(
        'Error 422: {"detail":"Validation error"}',
      );
    });

    it('should throw when env vars are missing', async () => {
      vi.stubEnv('PREPX_API_BASE_URL', '');

      await expect(
        tool.buildAndExecute(
          { note: 'test', topic_id: 1, title: 'Test' },
          signal,
        ),
      ).rejects.toThrow('Missing PREPX_API_BASE_URL');
    });
  });

  // -------------------------------------------------------------------------
  // NoteUpdateTool
  // -------------------------------------------------------------------------
  describe('NoteUpdateTool', () => {
    const tool = new NoteUpdateTool(messageBus);

    it('should call PATCH /agent/notes/:id', async () => {
      const responseBody = { id: 10, title: 'Updated Title' };
      const mockFetch = mockFetchOk(responseBody);

      const result = await tool.buildAndExecute(
        { note_id: 10, title: 'Updated Title' },
        signal,
      );

      expect(mockFetch).toHaveBeenCalledOnce();
      const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(url).toBe('https://api.test.prepx.dev/agent/notes/10');
      expect(options.method).toBe('PATCH');
      expect(JSON.parse(options.body as string)).toEqual({
        title: 'Updated Title',
      });
      expect(result.llmContent).toBe(JSON.stringify(responseBody));
    });

    it('should return error on 404', async () => {
      mockFetchError('{"detail":"Note not found"}', 404);

      const result = await tool.buildAndExecute({ note_id: 99 }, signal);

      expect(result.llmContent).toBe('Error 404: {"detail":"Note not found"}');
    });
  });

  // -------------------------------------------------------------------------
  // NoteGetTool
  // -------------------------------------------------------------------------
  describe('NoteGetTool', () => {
    const tool = new NoteGetTool(messageBus);

    it('should call GET /agent/notes/:id', async () => {
      const responseBody = {
        id: 5,
        topic_id: 3,
        title: 'My Note',
        note: 'Content here',
        status: 'published',
        image_url: null,
      };
      const mockFetch = mockFetchOk(responseBody);

      const result = await tool.buildAndExecute({ note_id: 5 }, signal);

      expect(mockFetch).toHaveBeenCalledOnce();
      const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(url).toBe('https://api.test.prepx.dev/agent/notes/5');
      expect(options.method).toBe('GET');
      expect(result.llmContent).toBe(JSON.stringify(responseBody));
    });

    it('should return error on 404', async () => {
      mockFetchError('{"detail":"Note not found"}', 404);

      const result = await tool.buildAndExecute({ note_id: 404 }, signal);

      expect(result.llmContent).toBe('Error 404: {"detail":"Note not found"}');
    });
  });
});
