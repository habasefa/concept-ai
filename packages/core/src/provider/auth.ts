/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// Basic mock structure mirroring opencode ProviderAuth namespace for parity
// tailored for a simpler context within concept-ai.

export interface AuthResult {
  type: 'api' | 'oauth';
  key?: string;
  access?: string;
  refresh?: string;
  expires?: number;
  accountId?: string;
}

const memoryStore: Record<string, AuthResult> = {};

export async function set(providerID: string, info: AuthResult): Promise<void> {
  memoryStore[providerID] = info;
}

export async function get(providerID: string): Promise<AuthResult | undefined> {
  return memoryStore[providerID];
}

// Simplified OAuth authorize flow
export async function authorize(_input: {
  providerID: string;
  method: number;
}): Promise<void> {
  throw new Error('OAuth not implemented for minimal concept-ai provider');
}

// Simplified API Key set flow
export async function api(input: {
  providerID: string;
  key: string;
}): Promise<void> {
  await set(input.providerID, {
    type: 'api',
    key: input.key,
  });
}

export async function getAllAuth(): Promise<Record<string, AuthResult>> {
  return memoryStore;
}
