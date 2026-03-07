/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type { LanguageModel } from 'ai';
import { createOpenAILanguageModel } from './openai.js';
import type {
  ParsedModelId,
  ProviderModel,
  ProviderInfo,
  ProviderConfig,
  SDK,
} from './types.js';
import { getProviderDefinitions, fetchCatalog } from './models/openai.js';

// ---------------------------------------------------------------------------
// Merge helper
// ---------------------------------------------------------------------------

function mergeDeep(
  target: Record<string, unknown>,
  source: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...target };
  for (const [key, value] of Object.entries(source)) {
    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      typeof result[key] === 'object' &&
      result[key] !== null &&
      !Array.isArray(result[key])
    ) {
      result[key] = mergeDeep(
        result[key] as Record<string, unknown>,
        value as Record<string, unknown>,
      );
    } else {
      result[key] = value;
    }
  }
  return result;
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash;
}

// ---------------------------------------------------------------------------
// ProviderRegistry Class
// ---------------------------------------------------------------------------

export class ProviderRegistry {
  private providers: Record<string, ProviderInfo> = {};
  private models: Map<string, LanguageModel> = new Map();
  private sdkInstances: Map<number, SDK> = new Map();
  private initialized = false;

  /**
   * Initializes the registry by loading the catalog, applying overrides,
   * detecting environment variables, and filtering disabled models/providers.
   */
  async initialize(
    configOverrides: Record<string, ProviderConfig> = {},
    options: {
      useDynamicCatalog?: boolean;
      disabledProviders?: string[];
      enabledProviders?: string[];
    } = {},
  ): Promise<void> {
    const disabled = new Set(options.disabledProviders ?? []);
    const enabled = options.enabledProviders
      ? new Set(options.enabledProviders)
      : null;

    const isProviderAllowed = (providerID: string): boolean => {
      if (enabled && !enabled.has(providerID)) return false;
      if (disabled.has(providerID)) return false;
      return true;
    };

    // Step 1: Load model catalog
    const database: Record<string, ProviderInfo> = options.useDynamicCatalog
      ? await fetchCatalog()
      : getProviderDefinitions();

    const mergedProviders: Record<string, ProviderInfo> = {};

    const mergeProvider = (
      providerID: string,
      patch: Partial<ProviderInfo>,
    ): void => {
      const existing = mergedProviders[providerID];
      if (existing) {
        mergedProviders[providerID] = mergeDeep(
          existing as unknown as Record<string, unknown>,
          patch as unknown as Record<string, unknown>,
        ) as unknown as ProviderInfo;
        return;
      }
      const match = database[providerID];
      if (!match) return;
      mergedProviders[providerID] = mergeDeep(
        match as unknown as Record<string, unknown>,
        patch as unknown as Record<string, unknown>,
      ) as unknown as ProviderInfo;
    };

    // Step 2 & 3: Environment variables (auto-detect)
    for (const [providerID, provider] of Object.entries(database)) {
      if (disabled.has(providerID)) continue;
      const apiKey = provider.env
        .map((envVar) => process.env[envVar])
        .find(Boolean);
      if (!apiKey) continue;
      mergeProvider(providerID, {
        source: 'env',
        key: provider.env.length === 1 ? apiKey : undefined,
      });
    }

    // Step 6: Filter and finalize
    for (const [_providerID, config] of Object.entries(configOverrides)) {
      const partial: Partial<ProviderInfo> = { source: 'config' };
      if (config.env) partial.env = config.env;
      if (config.name) partial.name = config.name;
      if (config.options) partial.options = config.options;
      mergeProvider(_providerID, partial);
    }

    for (const [providerID, provider] of Object.entries(mergedProviders)) {
      if (!isProviderAllowed(providerID)) {
        delete mergedProviders[providerID];
        continue;
      }

      const configProvider = configOverrides[providerID];
      for (const [modelID, model] of Object.entries(provider.models)) {
        if (model.status === 'deprecated') {
          delete provider.models[modelID];
          continue;
        }

        if (
          configProvider?.blacklist?.includes(modelID) ||
          (configProvider?.whitelist &&
            !configProvider.whitelist.includes(modelID))
        ) {
          delete provider.models[modelID];
          continue;
        }

        // Variant Generation (skipped for simplicity)
      }

      if (Object.keys(provider.models).length === 0) {
        delete mergedProviders[providerID];
      }
    }

    this.providers = mergedProviders;
    this.models.clear();
    this.sdkInstances.clear();
    this.initialized = true;
  }

  private checkInitialized(): void {
    if (!this.initialized) {
      throw new Error(
        'Provider registry not initialized. Call initialize() first.',
      );
    }
  }

  reset(): void {
    this.providers = {};
    this.models.clear();
    this.sdkInstances.clear();
    this.initialized = false;
  }

  // ---------------------------------------------------------------------------
  // Language model resolution
  // ---------------------------------------------------------------------------

  async getLanguage(model: ProviderModel): Promise<LanguageModel> {
    this.checkInitialized();
    const key = `${model.providerID}/${model.id}`;
    const cached = this.models.get(key);
    if (cached) return cached;

    const provider = this.providers[model.providerID];
    const options: Record<string, unknown> = { ...(provider?.options ?? {}) };

    if (options['apiKey'] === undefined && provider?.key) {
      options['apiKey'] = provider.key;
    }

    // Simple direct setup for OpenAI
    let language: LanguageModel;
    if (model.providerID === 'openai') {
      language = createOpenAILanguageModel(model.api.id, options);
    } else {
      throw new Error(`Unsupported provider: ${model.providerID}`);
    }

    this.models.set(key, language);
    return language;
  }

  // ---------------------------------------------------------------------------
  // Model lookup
  // ---------------------------------------------------------------------------

  parseModel(qualified: string): ParsedModelId {
    const [providerId, ...rest] = qualified.split('/');
    if (!rest.length) {
      throw new Error(
        `Invalid model ID "${qualified}". Expected format: "provider/model".`,
      );
    }
    return {
      providerId,
      modelId: rest.join('/'),
    };
  }

  formatModel(providerId: string, modelId: string): string {
    return `${providerId}/${modelId}`;
  }

  getModel(providerId: string, modelId: string): ProviderModel {
    this.checkInitialized();
    const provider = this.providers[providerId];
    if (!provider) {
      throw new Error(`Provider "${providerId}" not found.`);
    }

    const model = provider.models[modelId];
    if (!model) {
      throw new Error(
        `Model "${modelId}" not found in provider "${providerId}".`,
      );
    }

    return model;
  }

  getSmallModel(providerId: string): ProviderModel | undefined {
    this.checkInitialized();
    const provider = this.providers[providerId];
    if (!provider) return undefined;

    const priority = ['gpt-4o-mini', 'gpt-5-nano'];
    for (const search of priority) {
      for (const modelId of Object.keys(provider.models)) {
        if (modelId.includes(search)) {
          return provider.models[modelId];
        }
      }
    }

    const models = Object.values(provider.models);
    return models[0];
  }

  getDefaultModel(): ParsedModelId {
    this.checkInitialized();
    const providersList = Object.values(this.providers);
    if (providersList.length === 0) {
      throw new Error('No providers available. Check your API keys.');
    }

    const provider = providersList[0];
    const models = Object.values(provider.models);
    if (!models.length) {
      throw new Error(`No models available from provider "${provider.id}".`);
    }

    return { providerId: provider.id, modelId: models[0].id };
  }

  listProviders(): Record<string, ProviderInfo> {
    this.checkInitialized();
    return this.providers;
  }

  listAllModels(): ProviderModel[] {
    this.checkInitialized();
    const result: ProviderModel[] = [];
    for (const provider of Object.values(this.providers)) {
      result.push(...Object.values(provider.models));
    }
    return result;
  }

  isProviderAvailable(providerId: string): boolean {
    this.checkInitialized();
    return providerId in this.providers;
  }
}
