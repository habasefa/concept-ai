/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ToolInvocation } from './tools.js';
import {
  BaseDeclarativeTool,
  BaseToolInvocation,
  Kind,
  type ToolResult,
} from './tools.js';
import type { MessageBus } from '../confirmation-bus/message-bus.js';
import { TEXTBOOK_RAG_TOOL_NAME } from './tool-names.js';
import { TEXTBOOK_RAG_DEFINITION } from './definitions/coreTools.js';
import { resolveToolDeclaration } from './definitions/resolver.js';
import { callPrepxApi } from '../utils/prepxUtils.js';

interface TextbookRagParams {
  query: string;
}

class TextbookRagToolInvocation extends BaseToolInvocation<
  TextbookRagParams,
  ToolResult
> {
  constructor(
    params: TextbookRagParams,
    messageBus: MessageBus,
    _toolName?: string,
    _toolDisplayName?: string,
  ) {
    super(params, messageBus, _toolName, _toolDisplayName);
  }

  getDescription(): string {
    return `Performing RAG search for: "${this.params.query}"`;
  }

  async execute(
    _signal: AbortSignal,
    _updateOutput?: (output: string) => void,
  ): Promise<ToolResult> {
    const body: Record<string, unknown> = {
      query: this.params.query,
      limit: 10,
      score_threshold: 0.5,
    };

    return callPrepxApi('POST', '/vector/search', JSON.stringify(body));
  }
}

export class TextbookRagTool extends BaseDeclarativeTool<
  TextbookRagParams,
  ToolResult
> {
  static readonly Name = TEXTBOOK_RAG_TOOL_NAME;

  constructor(messageBus: MessageBus) {
    super(
      TextbookRagTool.Name,
      'TextbookRag',
      TEXTBOOK_RAG_DEFINITION.base.description!,
      Kind.Read,
      TEXTBOOK_RAG_DEFINITION.base.parametersJsonSchema,
      messageBus,
    );
  }

  override getSchema(modelId?: string) {
    return resolveToolDeclaration(TEXTBOOK_RAG_DEFINITION, modelId);
  }

  protected createInvocation(
    params: TextbookRagParams,
    messageBus: MessageBus,
    _toolName?: string,
    _displayName?: string,
  ): ToolInvocation<TextbookRagParams, ToolResult> {
    return new TextbookRagToolInvocation(
      params,
      messageBus,
      _toolName,
      _displayName,
    );
  }
}
