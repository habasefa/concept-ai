/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  BaseDeclarativeTool,
  BaseToolInvocation,
  Kind,
  type ToolResult,
} from './tools.js';

import type { MessageBus } from '../confirmation-bus/message-bus.js';
import { resolveToolDeclaration } from './definitions/resolver.js';
import { callPrepxApi } from '../utils/prepxUtils.js';
import {
  WORKSHEET_CREATE_TOOL_NAME,
  WORKSHEET_UPDATE_TOOL_NAME,
  WORKSHEET_GET_TOOL_NAME,
  WORKSHEET_ADD_QUESTIONS_TOOL_NAME,
  WORKSHEET_REMOVE_QUESTIONS_TOOL_NAME,
} from './tool-names.js';
import type { QuestionCreateParams, Difficulty } from './question.js';
import {
  WORKSHEET_CREATE_DEFINITION,
  WORKSHEET_UPDATE_DEFINITION,
  WORKSHEET_GET_DEFINITION,
  WORKSHEET_ADD_QUESTIONS_DEFINITION,
  WORKSHEET_REMOVE_QUESTIONS_DEFINITION,
} from './definitions/coreTools.js';

// ---------------------------------------------------------------------------
// WorksheetCreateTool
// ---------------------------------------------------------------------------

interface WorksheetCreateParams {
  title: string;
  objective: string;
  worksheet_type: string;
  difficulty?: Difficulty;
  et_completion?: string;
  group_ids: number[];
  topic_ids: number[];
  questions: QuestionCreateParams[];
}

class WorksheetCreateToolInvocation extends BaseToolInvocation<
  WorksheetCreateParams,
  ToolResult
> {
  getDescription(): string {
    return `Creating new worksheet: ${this.params.title}`;
  }

  async execute(_signal: AbortSignal): Promise<ToolResult> {
    return callPrepxApi(
      'POST',
      '/agent/worksheet',
      JSON.stringify(this.params),
    );
  }
}

export class WorksheetCreateTool extends BaseDeclarativeTool<
  WorksheetCreateParams,
  ToolResult
> {
  static readonly Name = WORKSHEET_CREATE_TOOL_NAME;
  constructor(messageBus: MessageBus) {
    super(
      WorksheetCreateTool.Name,
      'CreateWorksheet',
      WORKSHEET_CREATE_DEFINITION.base.description!,
      Kind.Execute,
      WORKSHEET_CREATE_DEFINITION.base.parametersJsonSchema,
      messageBus,
    );
  }
  override getSchema(modelId?: string) {
    return resolveToolDeclaration(WORKSHEET_CREATE_DEFINITION, modelId);
  }
  protected createInvocation(
    params: WorksheetCreateParams,
    messageBus: MessageBus,
    _toolName?: string,
    _displayName?: string,
  ) {
    return new WorksheetCreateToolInvocation(
      params,
      messageBus,
      _toolName,
      _displayName,
    );
  }
}

// ---------------------------------------------------------------------------
// WorksheetUpdateTool
// ---------------------------------------------------------------------------

interface WorksheetUpdateParams {
  worksheet_id: number;
  title?: string;
  objective?: string;
  worksheet_type?: string;
  difficulty?: Difficulty;
  topic_ids?: number[];
  et_completion?: string;
}

class WorksheetUpdateToolInvocation extends BaseToolInvocation<
  WorksheetUpdateParams,
  ToolResult
> {
  getDescription(): string {
    return `Updating worksheet #${this.params.worksheet_id}`;
  }

  async execute(_signal: AbortSignal): Promise<ToolResult> {
    const { worksheet_id, ...body } = this.params;
    return callPrepxApi(
      'PUT',
      `/agent/worksheet/${worksheet_id}`,
      JSON.stringify(body),
    );
  }
}

export class WorksheetUpdateTool extends BaseDeclarativeTool<
  WorksheetUpdateParams,
  ToolResult
> {
  static readonly Name = WORKSHEET_UPDATE_TOOL_NAME;
  constructor(messageBus: MessageBus) {
    super(
      WorksheetUpdateTool.Name,
      'UpdateWorksheet',
      WORKSHEET_UPDATE_DEFINITION.base.description!,
      Kind.Execute,
      WORKSHEET_UPDATE_DEFINITION.base.parametersJsonSchema,
      messageBus,
    );
  }
  override getSchema(modelId?: string) {
    return resolveToolDeclaration(WORKSHEET_UPDATE_DEFINITION, modelId);
  }
  protected createInvocation(
    params: WorksheetUpdateParams,
    messageBus: MessageBus,
    _toolName?: string,
    _displayName?: string,
  ) {
    return new WorksheetUpdateToolInvocation(
      params,
      messageBus,
      _toolName,
      _displayName,
    );
  }
}

// ---------------------------------------------------------------------------
// WorksheetGetTool
// ---------------------------------------------------------------------------

interface WorksheetGetParams {
  worksheet_id: number;
}

class WorksheetGetToolInvocation extends BaseToolInvocation<
  WorksheetGetParams,
  ToolResult
> {
  getDescription(): string {
    return `Retrieving worksheet #${this.params.worksheet_id}`;
  }

  async execute(_signal: AbortSignal): Promise<ToolResult> {
    return callPrepxApi(
      'GET',
      `/agent/worksheet/${this.params.worksheet_id}`,
      null,
    );
  }
}

export class WorksheetGetTool extends BaseDeclarativeTool<
  WorksheetGetParams,
  ToolResult
> {
  static readonly Name = WORKSHEET_GET_TOOL_NAME;
  constructor(messageBus: MessageBus) {
    super(
      WorksheetGetTool.Name,
      'GetWorksheet',
      WORKSHEET_GET_DEFINITION.base.description!,
      Kind.Read,
      WORKSHEET_GET_DEFINITION.base.parametersJsonSchema,
      messageBus,
    );
  }
  override getSchema(modelId?: string) {
    return resolveToolDeclaration(WORKSHEET_GET_DEFINITION, modelId);
  }
  protected createInvocation(
    params: WorksheetGetParams,
    messageBus: MessageBus,
    _toolName?: string,
    _displayName?: string,
  ) {
    return new WorksheetGetToolInvocation(
      params,
      messageBus,
      _toolName,
      _displayName,
    );
  }
}

// ---------------------------------------------------------------------------
// WorksheetAddQuestionsTool
// ---------------------------------------------------------------------------

interface WorksheetAddQuestionsParams {
  worksheet_id: number;
  questions: QuestionCreateParams[];
}

class WorksheetAddQuestionsToolInvocation extends BaseToolInvocation<
  WorksheetAddQuestionsParams,
  ToolResult
> {
  getDescription(): string {
    return `Adding ${this.params.questions.length} question(s) to worksheet #${this.params.worksheet_id}`;
  }

  async execute(_signal: AbortSignal): Promise<ToolResult> {
    return callPrepxApi(
      'PUT',
      `/agent/worksheet/${this.params.worksheet_id}/add_question`,
      JSON.stringify(this.params.questions),
    );
  }
}

export class WorksheetAddQuestionsTool extends BaseDeclarativeTool<
  WorksheetAddQuestionsParams,
  ToolResult
> {
  static readonly Name = WORKSHEET_ADD_QUESTIONS_TOOL_NAME;
  constructor(messageBus: MessageBus) {
    super(
      WorksheetAddQuestionsTool.Name,
      'AddWorksheetQuestions',
      WORKSHEET_ADD_QUESTIONS_DEFINITION.base.description!,
      Kind.Execute,
      WORKSHEET_ADD_QUESTIONS_DEFINITION.base.parametersJsonSchema,
      messageBus,
    );
  }
  override getSchema(modelId?: string) {
    return resolveToolDeclaration(WORKSHEET_ADD_QUESTIONS_DEFINITION, modelId);
  }
  protected createInvocation(
    params: WorksheetAddQuestionsParams,
    messageBus: MessageBus,
    _toolName?: string,
    _displayName?: string,
  ) {
    return new WorksheetAddQuestionsToolInvocation(
      params,
      messageBus,
      _toolName,
      _displayName,
    );
  }
}

// ---------------------------------------------------------------------------
// WorksheetRemoveQuestionsTool
// ---------------------------------------------------------------------------

interface WorksheetRemoveQuestionsParams {
  worksheet_id: number;
  question_ids: number[];
}

class WorksheetRemoveQuestionsToolInvocation extends BaseToolInvocation<
  WorksheetRemoveQuestionsParams,
  ToolResult
> {
  getDescription(): string {
    return `Removing ${this.params.question_ids.length} question(s) from worksheet #${this.params.worksheet_id}`;
  }

  async execute(_signal: AbortSignal): Promise<ToolResult> {
    return callPrepxApi(
      'PUT',
      `/agent/worksheet/${this.params.worksheet_id}/remove_question`,
      JSON.stringify(this.params.question_ids),
    );
  }
}

export class WorksheetRemoveQuestionsTool extends BaseDeclarativeTool<
  WorksheetRemoveQuestionsParams,
  ToolResult
> {
  static readonly Name = WORKSHEET_REMOVE_QUESTIONS_TOOL_NAME;
  constructor(messageBus: MessageBus) {
    super(
      WorksheetRemoveQuestionsTool.Name,
      'RemoveWorksheetQuestions',
      WORKSHEET_REMOVE_QUESTIONS_DEFINITION.base.description!,
      Kind.Execute,
      WORKSHEET_REMOVE_QUESTIONS_DEFINITION.base.parametersJsonSchema,
      messageBus,
    );
  }
  override getSchema(modelId?: string) {
    return resolveToolDeclaration(
      WORKSHEET_REMOVE_QUESTIONS_DEFINITION,
      modelId,
    );
  }
  protected createInvocation(
    params: WorksheetRemoveQuestionsParams,
    messageBus: MessageBus,
    _toolName?: string,
    _displayName?: string,
  ) {
    return new WorksheetRemoveQuestionsToolInvocation(
      params,
      messageBus,
      _toolName,
      _displayName,
    );
  }
}
