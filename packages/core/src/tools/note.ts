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
  NOTE_CREATE_TOOL_NAME,
  NOTE_UPDATE_TOOL_NAME,
  NOTE_GET_TOOL_NAME,
} from './tool-names.js';
import {
  NOTE_CREATE_DEFINITION,
  NOTE_UPDATE_DEFINITION,
  NOTE_GET_DEFINITION,
} from './definitions/coreTools.js';
import { resolveToolDeclaration } from './definitions/resolver.js';
import { callPrepxApi } from '../utils/prepxUtils.js';

// ---------------------------------------------------------------------------
// NoteCreateTool
// ---------------------------------------------------------------------------

interface NoteCreateParams {
  topic_id: number;
  title: string;
  note: string;
  image_url?: string;
  group_ids?: number[];
}

class NoteCreateToolInvocation extends BaseToolInvocation<
  NoteCreateParams,
  ToolResult
> {
  constructor(
    params: NoteCreateParams,
    messageBus: MessageBus,
    _toolName?: string,
    _toolDisplayName?: string,
  ) {
    super(params, messageBus, _toolName, _toolDisplayName);
  }

  getDescription(): string {
    return `Creating new note: ${this.params.title ?? '(untitled)'}`;
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

export class NoteCreateTool extends BaseDeclarativeTool<
  NoteCreateParams,
  ToolResult
> {
  static readonly Name = NOTE_CREATE_TOOL_NAME;

  constructor(messageBus: MessageBus) {
    super(
      NoteCreateTool.Name,
      'CreateNote',
      NOTE_CREATE_DEFINITION.base.description!,
      Kind.Execute,
      NOTE_CREATE_DEFINITION.base.parametersJsonSchema,
      messageBus,
    );
  }

  override getSchema(modelId?: string) {
    return resolveToolDeclaration(NOTE_CREATE_DEFINITION, modelId);
  }

  protected createInvocation(
    params: NoteCreateParams,
    messageBus: MessageBus,
    _toolName?: string,
    _displayName?: string,
  ): ToolInvocation<NoteCreateParams, ToolResult> {
    return new NoteCreateToolInvocation(
      params,
      messageBus,
      _toolName,
      _displayName,
    );
  }
}

// ---------------------------------------------------------------------------
// NoteUpdateTool
// ---------------------------------------------------------------------------

interface NoteUpdateParams {
  note_id: number;
  topic_id?: number;
  title?: string;
  note?: string;
  image_url?: string;
  group_ids?: number[];
}

class NoteUpdateToolInvocation extends BaseToolInvocation<
  NoteUpdateParams,
  ToolResult
> {
  constructor(
    params: NoteUpdateParams,
    messageBus: MessageBus,
    _toolName?: string,
    _toolDisplayName?: string,
  ) {
    super(params, messageBus, _toolName, _toolDisplayName);
  }

  getDescription(): string {
    return `Updating note #${this.params.note_id}`;
  }

  async execute(
    _signal: AbortSignal,
    _updateOutput?: (output: string) => void,
  ): Promise<ToolResult> {
    const body: Record<string, unknown> = {};
    if (this.params.topic_id !== undefined)
      body['topic_id'] = this.params.topic_id;
    if (this.params.title !== undefined) body['title'] = this.params.title;
    if (this.params.note !== undefined) body['note'] = this.params.note;
    if (this.params.group_ids !== undefined)
      body['group_ids'] = this.params.group_ids;
    if (this.params.image_url !== undefined)
      body['image_url'] = this.params.image_url;

    return callPrepxApi(
      'PATCH',
      `/agent/notes/${this.params.note_id}`,
      JSON.stringify(body),
    );
  }
}

export class NoteUpdateTool extends BaseDeclarativeTool<
  NoteUpdateParams,
  ToolResult
> {
  static readonly Name = NOTE_UPDATE_TOOL_NAME;

  constructor(messageBus: MessageBus) {
    super(
      NoteUpdateTool.Name,
      'UpdateNote',
      NOTE_UPDATE_DEFINITION.base.description!,
      Kind.Execute,
      NOTE_UPDATE_DEFINITION.base.parametersJsonSchema,
      messageBus,
    );
  }

  override getSchema(modelId?: string) {
    return resolveToolDeclaration(NOTE_UPDATE_DEFINITION, modelId);
  }

  protected createInvocation(
    params: NoteUpdateParams,
    messageBus: MessageBus,
    _toolName?: string,
    _displayName?: string,
  ): ToolInvocation<NoteUpdateParams, ToolResult> {
    return new NoteUpdateToolInvocation(
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
