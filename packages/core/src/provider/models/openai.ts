/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ProviderInfo } from '../types.js';

export const PROVIDER_OPENAI: ProviderInfo = {
  id: 'openai',
  name: 'OpenAI',
  env: ['OPENAI_API_KEY'],
  models: {
    'gpt-4o': {
      id: 'gpt-4o',
      providerID: 'openai',
      name: 'GPT-4o',
      api: {
        id: 'gpt-4o',
        url: 'https://api.openai.com/v1',
        npm: '@ai-sdk/openai',
      },
      status: 'active',
      capabilities: {
        temperature: true,
        reasoning: false,
        attachment: true,
        toolcall: true,
        interleaved: false,
        input: {
          text: true,
          image: true,
          audio: true,
          video: false,
          pdf: false,
        },
        output: {
          text: true,
          image: false,
          audio: false,
          video: false,
          pdf: false,
        },
      },
      cost: { input: 5, output: 15, cache: { read: 2.5, write: 5 } },
      limit: { context: 128000, output: 4096 },
      options: {},
      headers: {},
      family: 'gpt-4o',
      release_date: '2024-05-13',
      variants: {},
    },
    'gpt-4o-mini': {
      id: 'gpt-4o-mini',
      providerID: 'openai',
      name: 'GPT-4o mini',
      api: {
        id: 'gpt-4o-mini',
        url: 'https://api.openai.com/v1',
        npm: '@ai-sdk/openai',
      },
      status: 'active',
      capabilities: {
        temperature: true,
        reasoning: false,
        attachment: true,
        toolcall: true,
        interleaved: false,
        input: {
          text: true,
          image: true,
          audio: true,
          video: false,
          pdf: false,
        },
        output: {
          text: true,
          image: false,
          audio: false,
          video: false,
          pdf: false,
        },
      },
      cost: { input: 0.15, output: 0.6, cache: { read: 0.075, write: 0.15 } },
      limit: { context: 128000, output: 16384 },
      options: {},
      headers: {},
      family: 'gpt-4o',
      release_date: '2024-07-18',
      variants: {},
    },
  },
};

export function getProviderDefinitions(): Record<string, ProviderInfo> {
  return {
    openai: PROVIDER_OPENAI,
  };
}

export async function fetchCatalog(): Promise<Record<string, ProviderInfo>> {
  // Simplified for this rebuilt pattern
  return getProviderDefinitions();
}
