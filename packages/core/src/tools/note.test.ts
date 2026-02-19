/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  NoteDraftTool,
  NoteSubmitTool,
  NotePublishTool,
  NoteGetTool,
} from './note.js';
import { createMockMessageBus } from '../test-utils/mock-message-bus.js';

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function mockEnv() {
  vi.stubEnv('PREPX_API_URL', 'https://api.test.prepx.dev');
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
  // NoteDraftTool
  // -------------------------------------------------------------------------
  describe('NoteDraftTool', () => {
    const tool = new NoteDraftTool(messageBus);

    it('should call POST /agent/notes with correct body', async () => {
      const responseBody = { id: 42, status: 'draft', title: 'Test Note' };
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
      const responseBody = { id: 43, status: 'draft' };
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
      vi.stubEnv('PREPX_API_URL', '');

      await expect(
        tool.buildAndExecute(
          { note: 'test', topic_id: 1, title: 'Test' },
          signal,
        ),
      ).rejects.toThrow('Missing PREPX_API_URL');
    });
  });

  // -------------------------------------------------------------------------
  // NoteSubmitTool
  // -------------------------------------------------------------------------
  describe('NoteSubmitTool', () => {
    const tool = new NoteSubmitTool(messageBus);

    it('should call POST /agent/notes/:id/submit', async () => {
      const responseBody = { id: 10, status: 'pending' };
      const mockFetch = mockFetchOk(responseBody);

      const result = await tool.buildAndExecute({ note_id: 10 }, signal);

      expect(mockFetch).toHaveBeenCalledOnce();
      const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(url).toBe('https://api.test.prepx.dev/agent/notes/10/submit');
      expect(options.method).toBe('POST');
      expect(result.llmContent).toBe(JSON.stringify(responseBody));
    });

    it('should return error when note not in draft status', async () => {
      mockFetchError('{"detail":"Invalid transition"}', 400);

      const result = await tool.buildAndExecute({ note_id: 99 }, signal);

      expect(result.llmContent).toBe(
        'Error 400: {"detail":"Invalid transition"}',
      );
    });
  });

  // -------------------------------------------------------------------------
  // NotePublishTool
  // -------------------------------------------------------------------------
  describe('NotePublishTool', () => {
    const tool = new NotePublishTool(messageBus);

    it('should call POST /agent/notes/:id/publish', async () => {
      const responseBody = { id: 7, status: 'published' };
      const mockFetch = mockFetchOk(responseBody);

      const result = await tool.buildAndExecute({ note_id: 7 }, signal);

      expect(mockFetch).toHaveBeenCalledOnce();
      const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(url).toBe('https://api.test.prepx.dev/agent/notes/7/publish');
      expect(options.method).toBe('POST');
      expect(result.llmContent).toBe(JSON.stringify(responseBody));
    });

    it('should return error on 404', async () => {
      mockFetchError('{"detail":"Note not found"}', 404);

      const result = await tool.buildAndExecute({ note_id: 999 }, signal);

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
        status: 'draft',
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
