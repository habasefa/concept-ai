/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { createOpenAI } from '@ai-sdk/openai';
import type { LanguageModel } from 'ai';

/**
 * Creates an AI SDK LanguageModel for an OpenAI model.
 *
 * @param modelId - The model ID (e.g., "gpt-4o").
 * @param options - SDK options (apiKey, baseURL, headers, etc.).
 * @returns An AI SDK LanguageModel instance.
 */
export function createOpenAILanguageModel(
  modelId: string,
  options: Record<string, unknown> = {},
): LanguageModel {
  const openai = createOpenAI(options as any);
  return openai.languageModel(modelId);
}
