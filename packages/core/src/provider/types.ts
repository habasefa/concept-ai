/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Provider-agnostic type definitions for the multi-provider system.
 * Mirrors opencode's Provider.Model, Provider.Info, and related schemas.
 */

import type { LanguageModel } from 'ai';

// ---------------------------------------------------------------------------
// Model API
// ---------------------------------------------------------------------------

/** Which SDK package and endpoint to use for a model. */
export interface ModelApi {
  /** API-level model ID (may differ from the user-facing ID). */
  id: string;
  /** API base URL for the provider. */
  url: string;
  /** npm package name for the AI SDK adapter (e.g. "@ai-sdk/anthropic"). */
  npm: string;
}

// ---------------------------------------------------------------------------
// Model Capabilities
// ---------------------------------------------------------------------------

/** Input/output modality flags. */
export interface ModalityFlags {
  text: boolean;
  image: boolean;
  audio: boolean;
  video: boolean;
  pdf: boolean;
}

/** What a model can do. */
export interface ModelCapabilities {
  /** Whether the model supports temperature tuning. */
  temperature: boolean;
  /** Whether the model supports reasoning/thinking output. */
  reasoning: boolean;
  /** Whether the model supports file/image attachments. */
  attachment: boolean;
  /** Whether the model supports tool/function calling. */
  toolcall: boolean;
  /** Supported input modalities. */
  input: ModalityFlags;
  /** Supported output modalities. */
  output: ModalityFlags;
  /**
   * Whether the model supports interleaved reasoning in content.
   * Can be `true`, `false`, or `{ field: string }` for providers that
   * represent reasoning via a special providerOptions field.
   */
  interleaved: boolean | { field: string };
}

// ---------------------------------------------------------------------------
// Model Cost & Limits
// ---------------------------------------------------------------------------

/** Token cost per million tokens. */
export interface ModelCost {
  input: number;
  output: number;
  cache: {
    read: number;
    write: number;
  };
}

/** Context window and output token limits. */
export interface ModelLimits {
  context: number;
  output: number;
}

// ---------------------------------------------------------------------------
// Provider Model
// ---------------------------------------------------------------------------

/** Model status. */
export type ModelStatus = 'active' | 'ga' | 'preview' | 'alpha' | 'deprecated';

/**
 * A single model definition. Mirrors opencode's `Provider.Model`.
 */
export interface ProviderModel {
  /** User-facing model ID (e.g., "claude-sonnet-4-5"). */
  id: string;
  /** The provider this model belongs to. */
  providerID: string;
  /** Human-readable name. */
  name: string;
  /** SDK and API endpoint info. */
  api: ModelApi;
  /** Model lifecycle status. */
  status: ModelStatus;
  /** What the model can do. */
  capabilities: ModelCapabilities;
  /** Pricing info (per million tokens). */
  cost: ModelCost;
  /** Token limits. */
  limit: ModelLimits;
  /** Provider-specific options passed to the SDK. */
  options: Record<string, unknown>;
  /** Extra HTTP headers for this model's requests. */
  headers: Record<string, string>;
  /** Model family identifier (e.g., "claude", "gpt"). */
  family: string;
  /** Release date string (e.g., "2025-01-15"). */
  release_date: string;
  /** Named variants (e.g., "think-low", "no-think") with their options. */
  variants: Record<string, Record<string, unknown>>;
}

// ---------------------------------------------------------------------------
// Provider Info
// ---------------------------------------------------------------------------

/** How the provider was discovered. */
export type ProviderSource = 'env' | 'api' | 'config' | 'custom';

/**
 * Provider-level info. Mirrors opencode's `Provider.Info`.
 */
export interface ProviderInfo {
  /** Provider identifier (e.g., "anthropic", "openai", "google"). */
  id: string;
  /** Human-readable provider name. */
  name: string;
  /** Environment variable names to check for API keys (checked in order). */
  env: string[];
  /** All models available from this provider. */
  models: Record<string, ProviderModel>;
  /** How this provider was discovered/configured. */
  source?: ProviderSource;
  /** Resolved API key (if available). */
  key?: string;
  /** Provider-level options (apiKey, baseURL, headers, etc.). */
  options?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Provider Config (from user config file)
// ---------------------------------------------------------------------------

/**
 * User-configurable provider overrides (from config file).
 */
export interface ProviderConfig {
  name?: string;
  env?: string[];
  /** Only allow these model IDs. */
  whitelist?: string[];
  /** Block these model IDs. */
  blacklist?: string[];
  /** Model-level overrides. */
  models?: Record<
    string,
    Partial<ProviderModel> & {
      variants?: Record<
        string,
        Record<string, unknown> & { disabled?: boolean }
      >;
    }
  >;
  /** Provider-level SDK options. */
  options?: {
    apiKey?: string;
    baseURL?: string;
    timeout?: number | false;
    [key: string]: unknown;
  };
}

// ---------------------------------------------------------------------------
// Custom Loader
// ---------------------------------------------------------------------------

/**
 * Result of a custom provider loader.
 */
export interface CustomLoaderResult {
  /** Whether the provider should be auto-loaded. */
  autoload: boolean;
  /** Optional custom model creation function. */
  getModel?: CustomModelLoader;
  /** Extra SDK options to merge. */
  options?: Record<string, unknown>;
}

/** Function that creates a LanguageModel from an SDK instance. */
export type CustomModelLoader = (
  sdk: unknown,
  modelID: string,
  options?: Record<string, unknown>,
) => Promise<LanguageModel>;

/** Async function that produces a CustomLoaderResult for a provider. */
export type CustomLoader = (
  provider: ProviderInfo,
) => Promise<CustomLoaderResult>;

// ---------------------------------------------------------------------------
// Parsed Model ID
// ---------------------------------------------------------------------------

/** Parsed `"provider/model"` identifier. */
export interface ParsedModelId {
  providerId: string;
  modelId: string;
}

/** Any AI SDK provider. */
export type SDK = {
  languageModel: (modelId: string) => LanguageModel;
  [key: string]: unknown;
};
