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
  FLASHCARD_CREATE_TOOL_NAME,
  FLASHCARD_UPDATE_TOOL_NAME,
  FLASHCARD_GET_TOOL_NAME,
  FLASHCARD_ADD_QUESTIONS_TOOL_NAME,
  FLASHCARD_REMOVE_QUESTIONS_TOOL_NAME,
} from './tool-names.js';
import type { QuestionCreateParams } from './question.js';
import {
  FLASHCARD_CREATE_DEFINITION,
  FLASHCARD_UPDATE_DEFINITION,
  FLASHCARD_GET_DEFINITION,
  FLASHCARD_ADD_QUESTIONS_DEFINITION,
  FLASHCARD_REMOVE_QUESTIONS_DEFINITION,
} from './definitions/coreTools.js';

// ---------------------------------------------------------------------------
// FlashcardCreateTool
// ---------------------------------------------------------------------------

interface FlashcardCreateParams {
  title: string;
  topic_id?: number;
  group_ids: number[];
  questions: QuestionCreateParams[];
}

class FlashcardCreateToolInvocation extends BaseToolInvocation<
  FlashcardCreateParams,
  ToolResult
> {
  getDescription(): string {
    return `Creating new flashcard: ${this.params.title}`;
  }

  async execute(_signal: AbortSignal): Promise<ToolResult> {
    return callPrepxApi(
      'POST',
      '/agent/flashcards',
      JSON.stringify(this.params),
    );
  }
}

export class FlashcardCreateTool extends BaseDeclarativeTool<
  FlashcardCreateParams,
  ToolResult
> {
  static readonly Name = FLASHCARD_CREATE_TOOL_NAME;
  constructor(messageBus: MessageBus) {
    super(
      FlashcardCreateTool.Name,
      'CreateFlashcard',
      FLASHCARD_CREATE_DEFINITION.base.description!,
      Kind.Execute,
      FLASHCARD_CREATE_DEFINITION.base.parametersJsonSchema,
      messageBus,
    );
  }
  override getSchema(modelId?: string) {
    return resolveToolDeclaration(FLASHCARD_CREATE_DEFINITION, modelId);
  }
  protected createInvocation(
    params: FlashcardCreateParams,
    messageBus: MessageBus,
    _toolName?: string,
    _displayName?: string,
  ) {
    return new FlashcardCreateToolInvocation(
      params,
      messageBus,
      _toolName,
      _displayName,
    );
  }
}

// ---------------------------------------------------------------------------
// FlashcardUpdateTool
// ---------------------------------------------------------------------------

interface FlashcardUpdateParams {
  flashcard_id: number;
  title?: string;
  topic_id?: number;
}

class FlashcardUpdateToolInvocation extends BaseToolInvocation<
  FlashcardUpdateParams,
  ToolResult
> {
  getDescription(): string {
    return `Updating flashcard #${this.params.flashcard_id}`;
  }

  async execute(_signal: AbortSignal): Promise<ToolResult> {
    const { flashcard_id, ...body } = this.params;
    return callPrepxApi(
      'PUT',
      `/agent/flashcards/${flashcard_id}`,
      JSON.stringify(body),
    );
  }
}

export class FlashcardUpdateTool extends BaseDeclarativeTool<
  FlashcardUpdateParams,
  ToolResult
> {
  static readonly Name = FLASHCARD_UPDATE_TOOL_NAME;
  constructor(messageBus: MessageBus) {
    super(
      FlashcardUpdateTool.Name,
      'UpdateFlashcard',
      FLASHCARD_UPDATE_DEFINITION.base.description!,
      Kind.Execute,
      FLASHCARD_UPDATE_DEFINITION.base.parametersJsonSchema,
      messageBus,
    );
  }
  override getSchema(modelId?: string) {
    return resolveToolDeclaration(FLASHCARD_UPDATE_DEFINITION, modelId);
  }
  protected createInvocation(
    params: FlashcardUpdateParams,
    messageBus: MessageBus,
    _toolName?: string,
    _displayName?: string,
  ) {
    return new FlashcardUpdateToolInvocation(
      params,
      messageBus,
      _toolName,
      _displayName,
    );
  }
}

// ---------------------------------------------------------------------------
// FlashcardGetTool
// ---------------------------------------------------------------------------

interface FlashcardGetParams {
  flashcard_id: number;
}

class FlashcardGetToolInvocation extends BaseToolInvocation<
  FlashcardGetParams,
  ToolResult
> {
  getDescription(): string {
    return `Retrieving flashcard #${this.params.flashcard_id}`;
  }

  async execute(_signal: AbortSignal): Promise<ToolResult> {
    return callPrepxApi(
      'GET',
      `/agent/flashcards/${this.params.flashcard_id}`,
      null,
    );
  }
}

export class FlashcardGetTool extends BaseDeclarativeTool<
  FlashcardGetParams,
  ToolResult
> {
  static readonly Name = FLASHCARD_GET_TOOL_NAME;
  constructor(messageBus: MessageBus) {
    super(
      FlashcardGetTool.Name,
      'GetFlashcard',
      FLASHCARD_GET_DEFINITION.base.description!,
      Kind.Read,
      FLASHCARD_GET_DEFINITION.base.parametersJsonSchema,
      messageBus,
    );
  }
  override getSchema(modelId?: string) {
    return resolveToolDeclaration(FLASHCARD_GET_DEFINITION, modelId);
  }
  protected createInvocation(
    params: FlashcardGetParams,
    messageBus: MessageBus,
    _toolName?: string,
    _displayName?: string,
  ) {
    return new FlashcardGetToolInvocation(
      params,
      messageBus,
      _toolName,
      _displayName,
    );
  }
}

// ---------------------------------------------------------------------------
// FlashcardAddQuestionsTool
// ---------------------------------------------------------------------------

interface FlashcardAddQuestionsParams {
  flashcard_id: number;
  questions: QuestionCreateParams[];
}

class FlashcardAddQuestionsToolInvocation extends BaseToolInvocation<
  FlashcardAddQuestionsParams,
  ToolResult
> {
  getDescription(): string {
    return `Adding ${this.params.questions.length} question(s) to flashcard #${this.params.flashcard_id}`;
  }

  async execute(_signal: AbortSignal): Promise<ToolResult> {
    return callPrepxApi(
      'PUT',
      `/agent/flashcards/${this.params.flashcard_id}/add_question`,
      JSON.stringify(this.params.questions),
    );
  }
}

export class FlashcardAddQuestionsTool extends BaseDeclarativeTool<
  FlashcardAddQuestionsParams,
  ToolResult
> {
  static readonly Name = FLASHCARD_ADD_QUESTIONS_TOOL_NAME;
  constructor(messageBus: MessageBus) {
    super(
      FlashcardAddQuestionsTool.Name,
      'AddFlashcardQuestions',
      FLASHCARD_ADD_QUESTIONS_DEFINITION.base.description!,
      Kind.Execute,
      FLASHCARD_ADD_QUESTIONS_DEFINITION.base.parametersJsonSchema,
      messageBus,
    );
  }
  override getSchema(modelId?: string) {
    return resolveToolDeclaration(FLASHCARD_ADD_QUESTIONS_DEFINITION, modelId);
  }
  protected createInvocation(
    params: FlashcardAddQuestionsParams,
    messageBus: MessageBus,
    _toolName?: string,
    _displayName?: string,
  ) {
    return new FlashcardAddQuestionsToolInvocation(
      params,
      messageBus,
      _toolName,
      _displayName,
    );
  }
}

// ---------------------------------------------------------------------------
// FlashcardRemoveQuestionsTool
// ---------------------------------------------------------------------------

interface FlashcardRemoveQuestionsParams {
  flashcard_id: number;
  question_ids: number[];
}

class FlashcardRemoveQuestionsToolInvocation extends BaseToolInvocation<
  FlashcardRemoveQuestionsParams,
  ToolResult
> {
  getDescription(): string {
    return `Removing ${this.params.question_ids.length} question(s) from flashcard #${this.params.flashcard_id}`;
  }

  async execute(_signal: AbortSignal): Promise<ToolResult> {
    return callPrepxApi(
      'PUT',
      `/agent/flashcards/${this.params.flashcard_id}/remove_question`,
      JSON.stringify(this.params.question_ids),
    );
  }
}

export class FlashcardRemoveQuestionsTool extends BaseDeclarativeTool<
  FlashcardRemoveQuestionsParams,
  ToolResult
> {
  static readonly Name = FLASHCARD_REMOVE_QUESTIONS_TOOL_NAME;
  constructor(messageBus: MessageBus) {
    super(
      FlashcardRemoveQuestionsTool.Name,
      'RemoveFlashcardQuestions',
      FLASHCARD_REMOVE_QUESTIONS_DEFINITION.base.description!,
      Kind.Execute,
      FLASHCARD_REMOVE_QUESTIONS_DEFINITION.base.parametersJsonSchema,
      messageBus,
    );
  }
  override getSchema(modelId?: string) {
    return resolveToolDeclaration(
      FLASHCARD_REMOVE_QUESTIONS_DEFINITION,
      modelId,
    );
  }
  protected createInvocation(
    params: FlashcardRemoveQuestionsParams,
    messageBus: MessageBus,
    _toolName?: string,
    _displayName?: string,
  ) {
    return new FlashcardRemoveQuestionsToolInvocation(
      params,
      messageBus,
      _toolName,
      _displayName,
    );
  }
}
