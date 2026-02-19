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
import {
  NOTE_DRAFT_TOOL_NAME,
  NOTE_SUBMIT_TOOL_NAME,
  NOTE_PUBLISH_TOOL_NAME,
  NOTE_GET_TOOL_NAME,
} from './tool-names.js';
import {
  NOTE_DRAFT_DEFINITION,
  NOTE_SUBMIT_DEFINITION,
  NOTE_PUBLISH_DEFINITION,
  NOTE_GET_DEFINITION,
} from './definitions/coreTools.js';
import { resolveToolDeclaration } from './definitions/resolver.js';
import { callPrepxApi } from '../utils/prepxUtils.js';

// ---------------------------------------------------------------------------
// NoteDraftTool
// ---------------------------------------------------------------------------

interface NoteDraftParams {
  topic_id: number;
  title: string;
  note: string;
  image_url?: string;
  group_ids?: number[];
}

class NoteDraftToolInvocation extends BaseToolInvocation<
  NoteDraftParams,
  ToolResult
> {
  constructor(
    params: NoteDraftParams,
    messageBus: MessageBus,
    _toolName?: string,
    _toolDisplayName?: string,
  ) {
    super(params, messageBus, _toolName, _toolDisplayName);
  }

  getDescription(): string {
    return `Drafting note: ${this.params.title ?? '(untitled)'}`;
  }

  async execute(
    _signal: AbortSignal,
    _updateOutput?: (output: string) => void,
  ): Promise<ToolResult> {
    const body: Record<string, unknown> = {
      topic_id: this.params.topic_id,
      title: this.params.title,
      note: this.params.note,
    };
    if (this.params.group_ids !== undefined)
      body['group_ids'] = this.params.group_ids;
    if (this.params.image_url !== undefined)
      body['image_url'] = this.params.image_url;

    return callPrepxApi('POST', '/agent/notes', JSON.stringify(body));
  }
}

export class NoteDraftTool extends BaseDeclarativeTool<
  NoteDraftParams,
  ToolResult
> {
  static readonly Name = NOTE_DRAFT_TOOL_NAME;

  constructor(messageBus: MessageBus) {
    super(
      NoteDraftTool.Name,
      'DraftNote',
      NOTE_DRAFT_DEFINITION.base.description!,
      Kind.Execute,
      NOTE_DRAFT_DEFINITION.base.parametersJsonSchema,
      messageBus,
    );
  }

  override getSchema(modelId?: string) {
    return resolveToolDeclaration(NOTE_DRAFT_DEFINITION, modelId);
  }

  protected createInvocation(
    params: NoteDraftParams,
    messageBus: MessageBus,
    _toolName?: string,
    _displayName?: string,
  ): ToolInvocation<NoteDraftParams, ToolResult> {
    return new NoteDraftToolInvocation(
      params,
      messageBus,
      _toolName,
      _displayName,
    );
  }
}

// ---------------------------------------------------------------------------
// NoteSubmitTool
// ---------------------------------------------------------------------------

interface NoteSubmitParams {
  note_id: number;
}

class NoteSubmitToolInvocation extends BaseToolInvocation<
  NoteSubmitParams,
  ToolResult
> {
  constructor(
    params: NoteSubmitParams,
    messageBus: MessageBus,
    _toolName?: string,
    _toolDisplayName?: string,
  ) {
    super(params, messageBus, _toolName, _toolDisplayName);
  }

  getDescription(): string {
    return `Submitting note #${this.params.note_id} for review`;
  }

  async execute(
    _signal: AbortSignal,
    _updateOutput?: (output: string) => void,
  ): Promise<ToolResult> {
    return callPrepxApi(
      'POST',
      `/agent/notes/${this.params.note_id}/submit`,
      null,
    );
  }
}

export class NoteSubmitTool extends BaseDeclarativeTool<
  NoteSubmitParams,
  ToolResult
> {
  static readonly Name = NOTE_SUBMIT_TOOL_NAME;

  constructor(messageBus: MessageBus) {
    super(
      NoteSubmitTool.Name,
      'SubmitNote',
      NOTE_SUBMIT_DEFINITION.base.description!,
      Kind.Execute,
      NOTE_SUBMIT_DEFINITION.base.parametersJsonSchema,
      messageBus,
    );
  }

  override getSchema(modelId?: string) {
    return resolveToolDeclaration(NOTE_SUBMIT_DEFINITION, modelId);
  }

  protected createInvocation(
    params: NoteSubmitParams,
    messageBus: MessageBus,
    _toolName?: string,
    _displayName?: string,
  ): ToolInvocation<NoteSubmitParams, ToolResult> {
    return new NoteSubmitToolInvocation(
      params,
      messageBus,
      _toolName,
      _displayName,
    );
  }
}

// ---------------------------------------------------------------------------
// NotePublishTool
// ---------------------------------------------------------------------------

interface NotePublishParams {
  note_id: number;
}

class NotePublishToolInvocation extends BaseToolInvocation<
  NotePublishParams,
  ToolResult
> {
  constructor(
    params: NotePublishParams,
    messageBus: MessageBus,
    _toolName?: string,
    _toolDisplayName?: string,
  ) {
    super(params, messageBus, _toolName, _toolDisplayName);
  }

  getDescription(): string {
    return `Publishing note #${this.params.note_id}`;
  }

  async execute(
    _signal: AbortSignal,
    _updateOutput?: (output: string) => void,
  ): Promise<ToolResult> {
    return callPrepxApi(
      'POST',
      `/agent/notes/${this.params.note_id}/publish`,
      null,
    );
  }
}

export class NotePublishTool extends BaseDeclarativeTool<
  NotePublishParams,
  ToolResult
> {
  static readonly Name = NOTE_PUBLISH_TOOL_NAME;

  constructor(messageBus: MessageBus) {
    super(
      NotePublishTool.Name,
      'PublishNote',
      NOTE_PUBLISH_DEFINITION.base.description!,
      Kind.Execute,
      NOTE_PUBLISH_DEFINITION.base.parametersJsonSchema,
      messageBus,
    );
  }

  override getSchema(modelId?: string) {
    return resolveToolDeclaration(NOTE_PUBLISH_DEFINITION, modelId);
  }

  protected createInvocation(
    params: NotePublishParams,
    messageBus: MessageBus,
    _toolName?: string,
    _displayName?: string,
  ): ToolInvocation<NotePublishParams, ToolResult> {
    return new NotePublishToolInvocation(
      params,
      messageBus,
      _toolName,
      _displayName,
    );
  }
}

// ---------------------------------------------------------------------------
// NoteGetTool
// ---------------------------------------------------------------------------

interface NoteGetParams {
  note_id: number;
}

class NoteGetToolInvocation extends BaseToolInvocation<
  NoteGetParams,
  ToolResult
> {
  constructor(
    params: NoteGetParams,
    messageBus: MessageBus,
    _toolName?: string,
    _toolDisplayName?: string,
  ) {
    super(params, messageBus, _toolName, _toolDisplayName);
  }

  getDescription(): string {
    return `Retrieving note #${this.params.note_id}`;
  }

  async execute(
    _signal: AbortSignal,
    _updateOutput?: (output: string) => void,
  ): Promise<ToolResult> {
    return callPrepxApi('GET', `/agent/notes/${this.params.note_id}`, null);
  }
}

export class NoteGetTool extends BaseDeclarativeTool<
  NoteGetParams,
  ToolResult
> {
  static readonly Name = NOTE_GET_TOOL_NAME;

  constructor(messageBus: MessageBus) {
    super(
      NoteGetTool.Name,
      'GetNote',
      NOTE_GET_DEFINITION.base.description!,
      Kind.Read,
      NOTE_GET_DEFINITION.base.parametersJsonSchema,
      messageBus,
    );
  }

  override getSchema(modelId?: string) {
    return resolveToolDeclaration(NOTE_GET_DEFINITION, modelId);
  }

  protected createInvocation(
    params: NoteGetParams,
    messageBus: MessageBus,
    _toolName?: string,
    _displayName?: string,
  ): ToolInvocation<NoteGetParams, ToolResult> {
    return new NoteGetToolInvocation(
      params,
      messageBus,
      _toolName,
      _displayName,
    );
  }
}
