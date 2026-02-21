/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  QuizCreateTool,
  QuizUpdateTool,
  QuizGetTool,
  QuizAddQuestionsTool,
  QuizRemoveQuestionsTool,
} from './quiz.js';
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

describe('Quiz Tools', () => {
  const messageBus = createMockMessageBus();
  const signal = new AbortController().signal;

  beforeEach(() => {
    mockEnv();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  describe('QuizCreateTool', () => {
    const tool = new QuizCreateTool(messageBus);

    it('should successfully create a quiz', async () => {
      const responseBody = { id: 1, title: 'Test Quiz' };
      const mockFetch = mockFetchOk(responseBody, 201);

      const result = await tool.buildAndExecute(
        {
          title: 'Test Quiz',
          group_ids: [1],
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
      expect(url).toBe('https://api.test.prepx.dev/agent/quiz');
      expect(options.method).toBe('POST');
      expect(JSON.parse(options.body as string)).toEqual({
        title: 'Test Quiz',
        group_ids: [1],
        questions: [
          {
            question_text: 'Q1',
            question_type: 'multiple_choice',
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
          title: 'Test Quiz',
          group_ids: [1],
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

  describe('QuizUpdateTool', () => {
    const tool = new QuizUpdateTool(messageBus);

    it('should successfully update a quiz', async () => {
      const responseBody = { id: 1, title: 'Updated' };
      const mockFetch = mockFetchOk(responseBody);

      const result = await tool.buildAndExecute(
        { quiz_id: 1, title: 'Updated' },
        signal,
      );

      expect(mockFetch).toHaveBeenCalledOnce();
      const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(url).toBe('https://api.test.prepx.dev/agent/quiz/1');
      expect(options.method).toBe('PUT');
      expect(JSON.parse(options.body as string)).toEqual({
        title: 'Updated',
      });
      expect(result.llmContent).toBe(JSON.stringify(responseBody));
    });
  });

  describe('QuizGetTool', () => {
    const tool = new QuizGetTool(messageBus);

    it('should successfully get a quiz', async () => {
      const responseBody = { id: 1, title: 'Test Quiz' };
      const mockFetch = mockFetchOk(responseBody);

      const result = await tool.buildAndExecute({ quiz_id: 1 }, signal);

      expect(mockFetch).toHaveBeenCalledOnce();
      const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(url).toBe('https://api.test.prepx.dev/agent/quiz/1');
      expect(options.method).toBe('GET');
      expect(result.llmContent).toBe(JSON.stringify(responseBody));
    });
  });

  describe('QuizAddQuestionsTool', () => {
    const tool = new QuizAddQuestionsTool(messageBus);

    it('should successfully add questions to a quiz', async () => {
      const responseBody = { id: 1 };
      const mockFetch = mockFetchOk(responseBody);

      const result = await tool.buildAndExecute(
        {
          quiz_id: 1,
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
      expect(url).toBe('https://api.test.prepx.dev/agent/quiz/1/add_question');
      expect(options.method).toBe('PUT');
      expect(JSON.parse(options.body as string)).toEqual([
        {
          question_text: 'New Q',
          question_type: 'multiple_choice',
          choices: [],
        },
      ]);
      expect(result.llmContent).toBe(JSON.stringify(responseBody));
    });
  });

  describe('QuizRemoveQuestionsTool', () => {
    const tool = new QuizRemoveQuestionsTool(messageBus);

    it('should successfully remove questions from a quiz', async () => {
      const responseBody = { id: 1 };
      const mockFetch = mockFetchOk(responseBody);

      const result = await tool.buildAndExecute(
        { quiz_id: 1, question_ids: [100, 101] },
        signal,
      );

      expect(mockFetch).toHaveBeenCalledOnce();
      const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(url).toBe(
        'https://api.test.prepx.dev/agent/quiz/1/remove_question',
      );
      expect(options.method).toBe('PUT');
      expect(JSON.parse(options.body as string)).toEqual([100, 101]);
      expect(result.llmContent).toBe(JSON.stringify(responseBody));
    });
  });
});
