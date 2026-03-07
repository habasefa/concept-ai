/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type { APICallError } from 'ai';
import { STATUS_CODES } from 'node:http';

/**
 * Handle formatting and parsing of provider errors.
 * Mirrored from opencode's ProviderError namespace to follow the concept-ai pattern.
 */

const OVERFLOW_PATTERNS = [
  /exceeds the context window/i, // OpenAI (Completions + Responses API message text)
  /context[_ ]length[_ ]exceeded/i, // Generic fallback
];

function isOpenAiErrorRetryable(e: APICallError): boolean {
  const status = e.statusCode;
  if (!status) return e.isRetryable;
  // openai sometimes returns 404 for models that are actually available
  return status === 404 || e.isRetryable;
}

function isOverflow(message: string): boolean {
  if (OVERFLOW_PATTERNS.some((p) => p.test(message))) return true;
  return /^4(00|13)\s*(status code)?\s*\(no body\)/i.test(message);
}

function error(providerID: string, err: APICallError): string {
  return err.message;
}

export function message(providerID: string, e: APICallError): string {
  const iife = () => {
    const msg = e.message;
    if (msg === '') {
      if (e.responseBody) return e.responseBody;
      if (e.statusCode) {
        const err = STATUS_CODES[e.statusCode];
        if (err) return err;
      }
      return 'Unknown error';
    }

    const transformed = error(providerID, e);
    if (transformed !== msg) {
      return transformed;
    }
    if (
      !e.responseBody ||
      (e.statusCode && msg !== STATUS_CODES[e.statusCode])
    ) {
      return msg;
    }

    try {
      const body = JSON.parse(e.responseBody);
      // try to extract common error message fields
      const errMsg = body.message || body.error || body.error?.message;
      if (errMsg && typeof errMsg === 'string') {
        return `${msg}: ${errMsg}`;
      }
    } catch {
      // ignrore
    }

    return `${msg}: ${e.responseBody}`;
  };
  return iife().trim();
}

function json(input: unknown): any {
  if (typeof input === 'string') {
    try {
      const result = JSON.parse(input);
      if (result && typeof result === 'object') return result;
      return undefined;
    } catch {
      return undefined;
    }
  }
  if (typeof input === 'object' && input !== null) {
    return input;
  }
  return undefined;
}

export type ParsedStreamError =
  | {
      type: 'context_overflow';
      message: string;
      responseBody: string;
    }
  | {
      type: 'api_error';
      message: string;
      isRetryable: false;
      responseBody: string;
    };

export function parseStreamError(
  input: unknown,
): ParsedStreamError | undefined {
  const body = json(input);
  if (!body) return undefined;

  const responseBody = JSON.stringify(body);
  if (body.type !== 'error') return undefined;

  switch (body?.error?.code) {
    case 'context_length_exceeded':
      return {
        type: 'context_overflow',
        message: 'Input exceeds context window of this model',
        responseBody,
      };
    case 'insufficient_quota':
      return {
        type: 'api_error',
        message: 'Quota exceeded. Check your plan and billing details.',
        isRetryable: false,
        responseBody,
      };
    case 'invalid_prompt':
      return {
        type: 'api_error',
        message:
          typeof body?.error?.message === 'string'
            ? body?.error?.message
            : 'Invalid prompt.',
        isRetryable: false,
        responseBody,
      };
  }
  return undefined;
}

export type ParsedAPICallError =
  | {
      type: 'context_overflow';
      message: string;
      responseBody?: string;
    }
  | {
      type: 'api_error';
      message: string;
      statusCode?: number;
      isRetryable: boolean;
      responseHeaders?: Record<string, string>;
      responseBody?: string;
      metadata?: Record<string, string>;
    };

export function parseAPICallError(input: {
  providerID: string;
  error: APICallError;
}): ParsedAPICallError {
  const m = message(input.providerID, input.error);
  if (isOverflow(m)) {
    return {
      type: 'context_overflow',
      message: m,
      responseBody: input.error.responseBody,
    };
  }

  const metadata = input.error.url ? { url: input.error.url } : undefined;
  return {
    type: 'api_error',
    message: m,
    statusCode: input.error.statusCode,
    isRetryable: input.providerID.startsWith('openai')
      ? isOpenAiErrorRetryable(input.error)
      : input.error.isRetryable,
    responseHeaders: input.error.responseHeaders,
    responseBody: input.error.responseBody,
    metadata,
  };
}
