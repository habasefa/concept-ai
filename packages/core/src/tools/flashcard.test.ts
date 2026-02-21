/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  FlashcardCreateTool,
  FlashcardUpdateTool,
  FlashcardGetTool,
  FlashcardAddQuestionsTool,
  FlashcardRemoveQuestionsTool,
} from './flashcard.js';
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

describe('Flashcard Tools', () => {
  const messageBus = createMockMessageBus();
  const signal = new AbortController().signal;

  beforeEach(() => {
    mockEnv();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  describe('FlashcardCreateTool', () => {
    const tool = new FlashcardCreateTool(messageBus);

    it('should successfully create a flashcard deck', async () => {
      const responseBody = { id: 1, title: 'Test FC' };
      const mockFetch = mockFetchOk(responseBody, 201);

      const result = await tool.buildAndExecute(
        {
          title: 'Test FC',
          group_ids: [1],
          questions: [
            {
              question_text: 'Front',
              solution_text: 'Back',
              question_type: QuestionType.flashcard,
              choices: [],
            },
          ],
        },
        signal,
      );

      expect(mockFetch).toHaveBeenCalledOnce();
      const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(url).toBe('https://api.test.prepx.dev/agent/flashcards');
      expect(options.method).toBe('POST');
      expect(JSON.parse(options.body as string)).toEqual({
        title: 'Test FC',
        group_ids: [1],
        questions: [
          {
            question_text: 'Front',
            solution_text: 'Back',
            question_type: 'flashcard',
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
          title: 'Test FC',
          group_ids: [1],
          questions: [
            {
              question_text: 'Front',
              solution_text: 'Back',
              question_type: QuestionType.flashcard,
              choices: [],
            },
          ],
        },
        signal,
      );

      expect(result.llmContent).toContain('API Error');
    });
  });

  describe('FlashcardUpdateTool', () => {
    const tool = new FlashcardUpdateTool(messageBus);

    it('should successfully update a flashcard', async () => {
      const responseBody = { id: 1, title: 'Updated' };
      const mockFetch = mockFetchOk(responseBody);

      const result = await tool.buildAndExecute(
        { flashcard_id: 1, title: 'Updated' },
        signal,
      );

      expect(mockFetch).toHaveBeenCalledOnce();
      const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(url).toBe('https://api.test.prepx.dev/agent/flashcards/1');
      expect(options.method).toBe('PUT');
      expect(JSON.parse(options.body as string)).toEqual({
        title: 'Updated',
      });
      expect(result.llmContent).toBe(JSON.stringify(responseBody));
    });
  });

  describe('FlashcardGetTool', () => {
    const tool = new FlashcardGetTool(messageBus);

    it('should successfully get a flashcard', async () => {
      const responseBody = { id: 1, title: 'Test FC' };
      const mockFetch = mockFetchOk(responseBody);

      const result = await tool.buildAndExecute({ flashcard_id: 1 }, signal);

      expect(mockFetch).toHaveBeenCalledOnce();
      const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(url).toBe('https://api.test.prepx.dev/agent/flashcards/1');
      expect(options.method).toBe('GET');
      expect(result.llmContent).toBe(JSON.stringify(responseBody));
    });
  });

  describe('FlashcardAddQuestionsTool', () => {
    const tool = new FlashcardAddQuestionsTool(messageBus);

    it('should successfully add questions to a flashcard', async () => {
      const responseBody = { id: 1 };
      const mockFetch = mockFetchOk(responseBody);

      const result = await tool.buildAndExecute(
        {
          flashcard_id: 1,
          questions: [
            {
              question_text: 'Front',
              question_type: QuestionType.flashcard,
              solution_text: 'Back',
              choices: [],
            },
          ],
        },
        signal,
      );

      expect(mockFetch).toHaveBeenCalledOnce();
      const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(url).toBe(
        'https://api.test.prepx.dev/agent/flashcards/1/add_question',
      );
      expect(options.method).toBe('PUT');
      expect(JSON.parse(options.body as string)).toEqual([
        {
          question_text: 'Front',
          question_type: 'flashcard',
          solution_text: 'Back',
          choices: [],
        },
      ]);
      expect(result.llmContent).toBe(JSON.stringify(responseBody));
    });
  });

  describe('FlashcardRemoveQuestionsTool', () => {
    const tool = new FlashcardRemoveQuestionsTool(messageBus);

    it('should successfully remove questions from a flashcard', async () => {
      const responseBody = { id: 1 };
      const mockFetch = mockFetchOk(responseBody);

      const result = await tool.buildAndExecute(
        { flashcard_id: 1, question_ids: [100, 101] },
        signal,
      );

      expect(mockFetch).toHaveBeenCalledOnce();
      const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(url).toBe(
        'https://api.test.prepx.dev/agent/flashcards/1/remove_question',
      );
      expect(options.method).toBe('PUT');
      expect(JSON.parse(options.body as string)).toEqual([100, 101]);
      expect(result.llmContent).toBe(JSON.stringify(responseBody));
    });
  });
});
