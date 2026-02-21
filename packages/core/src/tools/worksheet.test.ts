/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  WorksheetCreateTool,
  WorksheetUpdateTool,
  WorksheetGetTool,
  WorksheetAddQuestionsTool,
  WorksheetRemoveQuestionsTool,
} from './worksheet.js';
import { createMockMessageBus } from '../test-utils/mock-message-bus.js';
import { QuestionType } from './question.js';

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

describe('Worksheet Tools', () => {
  const messageBus = createMockMessageBus();
  const signal = new AbortController().signal;

  beforeEach(() => {
    mockEnv();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  describe('WorksheetCreateTool', () => {
    const tool = new WorksheetCreateTool(messageBus);

    it('should successfully create a worksheet', async () => {
      const responseBody = { id: 1, title: 'Test WS' };
      const mockFetch = mockFetchOk(responseBody, 201);

      const result = await tool.buildAndExecute(
        {
          title: 'Test WS',
          objective: 'Test Objective',
          worksheet_type: 'Test Type',
          group_ids: [1],
          topic_ids: [2],
          questions: [
            {
              question_text: 'Q1',
              question_type: QuestionType.multiple_choice,
              choices: [],
            },
          ],
        },
        signal,
      );

      expect(mockFetch).toHaveBeenCalledOnce();
      const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(url).toBe('https://api.test.prepx.dev/agent/worksheet');
      expect(options.method).toBe('POST');
      expect(JSON.parse(options.body as string)).toEqual({
        title: 'Test WS',
        objective: 'Test Objective',
        worksheet_type: 'Test Type',
        group_ids: [1],
        topic_ids: [2],
        questions: [
          {
            question_text: 'Q1',
            question_type: QuestionType.multiple_choice,
            choices: [],
          },
        ],
      });
      expect(result.llmContent).toBe(JSON.stringify(responseBody));
    });

    it('should handle API errors', async () => {
      mockFetchError('{"detail":"API Error"}', 400);

      const result = await tool.buildAndExecute(
        {
          title: 'Test WS',
          objective: 'Test Objective',
          worksheet_type: 'Test Type',
          group_ids: [1],
          topic_ids: [2],
          questions: [
            {
              question_text: 'Q1',
              question_type: QuestionType.multiple_choice,
              choices: [],
            },
          ],
        },
        signal,
      );

      expect(result.llmContent).toContain('API Error');
    });
  });

  describe('WorksheetUpdateTool', () => {
    const tool = new WorksheetUpdateTool(messageBus);

    it('should successfully update a worksheet', async () => {
      const responseBody = { id: 1, title: 'Updated' };
      const mockFetch = mockFetchOk(responseBody);

      const result = await tool.buildAndExecute(
        { worksheet_id: 1, title: 'Updated' },
        signal,
      );

      expect(mockFetch).toHaveBeenCalledOnce();
      const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(url).toBe('https://api.test.prepx.dev/agent/worksheet/1');
      expect(options.method).toBe('PUT');
      expect(JSON.parse(options.body as string)).toEqual({
        title: 'Updated',
      });
      expect(result.llmContent).toBe(JSON.stringify(responseBody));
    });
  });

  describe('WorksheetGetTool', () => {
    const tool = new WorksheetGetTool(messageBus);

    it('should successfully get a worksheet', async () => {
      const responseBody = { id: 1, title: 'Test WS' };
      const mockFetch = mockFetchOk(responseBody);

      const result = await tool.buildAndExecute({ worksheet_id: 1 }, signal);

      expect(mockFetch).toHaveBeenCalledOnce();
      const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(url).toBe('https://api.test.prepx.dev/agent/worksheet/1');
      expect(options.method).toBe('GET');
      expect(result.llmContent).toBe(JSON.stringify(responseBody));
    });
  });

  describe('WorksheetAddQuestionsTool', () => {
    const tool = new WorksheetAddQuestionsTool(messageBus);

    it('should successfully add questions to a worksheet', async () => {
      const responseBody = { id: 1 };
      const mockFetch = mockFetchOk(responseBody);

      const result = await tool.buildAndExecute(
        {
          worksheet_id: 1,
          questions: [
            {
              question_text: 'New Q',
              question_type: QuestionType.multiple_choice,
              choices: [],
            },
          ],
        },
        signal,
      );

      expect(mockFetch).toHaveBeenCalledOnce();
      const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(url).toBe(
        'https://api.test.prepx.dev/agent/worksheet/1/add_question',
      );
      expect(options.method).toBe('PUT');
      expect(JSON.parse(options.body as string)).toEqual([
        {
          question_text: 'New Q',
          question_type: QuestionType.multiple_choice,
          choices: [],
        },
      ]);
      expect(result.llmContent).toBe(JSON.stringify(responseBody));
    });
  });

  describe('WorksheetRemoveQuestionsTool', () => {
    const tool = new WorksheetRemoveQuestionsTool(messageBus);

    it('should successfully remove questions from a worksheet', async () => {
      const responseBody = { id: 1 };
      const mockFetch = mockFetchOk(responseBody);

      const result = await tool.buildAndExecute(
        { worksheet_id: 1, question_ids: [100, 101] },
        signal,
      );

      expect(mockFetch).toHaveBeenCalledOnce();
      const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(url).toBe(
        'https://api.test.prepx.dev/agent/worksheet/1/remove_question',
      );
      expect(options.method).toBe('PUT');
      expect(JSON.parse(options.body as string)).toEqual([100, 101]);
      expect(result.llmContent).toBe(JSON.stringify(responseBody));
    });
  });
});
