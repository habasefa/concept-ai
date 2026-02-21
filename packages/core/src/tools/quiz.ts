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
  QUIZ_CREATE_TOOL_NAME,
  QUIZ_UPDATE_TOOL_NAME,
  QUIZ_GET_TOOL_NAME,
  QUIZ_ADD_QUESTIONS_TOOL_NAME,
  QUIZ_REMOVE_QUESTIONS_TOOL_NAME,
} from './tool-names.js';
import type { QuestionCreateParams } from './question.js';
import {
  QUIZ_CREATE_DEFINITION,
  QUIZ_UPDATE_DEFINITION,
  QUIZ_GET_DEFINITION,
  QUIZ_ADD_QUESTIONS_DEFINITION,
  QUIZ_REMOVE_QUESTIONS_DEFINITION,
} from './definitions/coreTools.js';

// ---------------------------------------------------------------------------
// QuizCreateTool
// ---------------------------------------------------------------------------

interface QuizCreateParams {
  title: string;
  topic_id?: number;
  group_ids: number[];
  questions: QuestionCreateParams[];
}

class QuizCreateToolInvocation extends BaseToolInvocation<
  QuizCreateParams,
  ToolResult
> {
  getDescription(): string {
    return `Creating new quiz: ${this.params.title}`;
  }

  async execute(_signal: AbortSignal): Promise<ToolResult> {
    return callPrepxApi('POST', '/agent/quiz', JSON.stringify(this.params));
  }
}

export class QuizCreateTool extends BaseDeclarativeTool<
  QuizCreateParams,
  ToolResult
> {
  static readonly Name = QUIZ_CREATE_TOOL_NAME;
  constructor(messageBus: MessageBus) {
    super(
      QuizCreateTool.Name,
      'CreateQuiz',
      QUIZ_CREATE_DEFINITION.base.description!,
      Kind.Execute,
      QUIZ_CREATE_DEFINITION.base.parametersJsonSchema,
      messageBus,
    );
  }
  override getSchema(modelId?: string) {
    return resolveToolDeclaration(QUIZ_CREATE_DEFINITION, modelId);
  }
  protected createInvocation(
    params: QuizCreateParams,
    messageBus: MessageBus,
    _toolName?: string,
    _displayName?: string,
  ) {
    return new QuizCreateToolInvocation(
      params,
      messageBus,
      _toolName,
      _displayName,
    );
  }
}

// ---------------------------------------------------------------------------
// QuizUpdateTool
// ---------------------------------------------------------------------------

interface QuizUpdateParams {
  quiz_id: number;
  title?: string;
  topic_id?: number;
}

class QuizUpdateToolInvocation extends BaseToolInvocation<
  QuizUpdateParams,
  ToolResult
> {
  getDescription(): string {
    return `Updating quiz #${this.params.quiz_id}`;
  }

  async execute(_signal: AbortSignal): Promise<ToolResult> {
    const { quiz_id, ...body } = this.params;
    return callPrepxApi('PUT', `/agent/quiz/${quiz_id}`, JSON.stringify(body));
  }
}

export class QuizUpdateTool extends BaseDeclarativeTool<
  QuizUpdateParams,
  ToolResult
> {
  static readonly Name = QUIZ_UPDATE_TOOL_NAME;
  constructor(messageBus: MessageBus) {
    super(
      QuizUpdateTool.Name,
      'UpdateQuiz',
      QUIZ_UPDATE_DEFINITION.base.description!,
      Kind.Execute,
      QUIZ_UPDATE_DEFINITION.base.parametersJsonSchema,
      messageBus,
    );
  }
  override getSchema(modelId?: string) {
    return resolveToolDeclaration(QUIZ_UPDATE_DEFINITION, modelId);
  }
  protected createInvocation(
    params: QuizUpdateParams,
    messageBus: MessageBus,
    _toolName?: string,
    _displayName?: string,
  ) {
    return new QuizUpdateToolInvocation(
      params,
      messageBus,
      _toolName,
      _displayName,
    );
  }
}

// ---------------------------------------------------------------------------
// QuizGetTool
// ---------------------------------------------------------------------------

interface QuizGetParams {
  quiz_id: number;
}

class QuizGetToolInvocation extends BaseToolInvocation<
  QuizGetParams,
  ToolResult
> {
  getDescription(): string {
    return `Retrieving quiz #${this.params.quiz_id}`;
  }

  async execute(_signal: AbortSignal): Promise<ToolResult> {
    return callPrepxApi('GET', `/agent/quiz/${this.params.quiz_id}`, null);
  }
}

export class QuizGetTool extends BaseDeclarativeTool<
  QuizGetParams,
  ToolResult
> {
  static readonly Name = QUIZ_GET_TOOL_NAME;
  constructor(messageBus: MessageBus) {
    super(
      QuizGetTool.Name,
      'GetQuiz',
      QUIZ_GET_DEFINITION.base.description!,
      Kind.Read,
      QUIZ_GET_DEFINITION.base.parametersJsonSchema,
      messageBus,
    );
  }
  override getSchema(modelId?: string) {
    return resolveToolDeclaration(QUIZ_GET_DEFINITION, modelId);
  }
  protected createInvocation(
    params: QuizGetParams,
    messageBus: MessageBus,
    _toolName?: string,
    _displayName?: string,
  ) {
    return new QuizGetToolInvocation(
      params,
      messageBus,
      _toolName,
      _displayName,
    );
  }
}

// ---------------------------------------------------------------------------
// QuizAddQuestionsTool
// ---------------------------------------------------------------------------

interface QuizAddQuestionsParams {
  quiz_id: number;
  questions: QuestionCreateParams[];
}

class QuizAddQuestionsToolInvocation extends BaseToolInvocation<
  QuizAddQuestionsParams,
  ToolResult
> {
  getDescription(): string {
    return `Adding ${this.params.questions.length} question(s) to quiz #${this.params.quiz_id}`;
  }

  async execute(_signal: AbortSignal): Promise<ToolResult> {
    return callPrepxApi(
      'PUT',
      `/agent/quiz/${this.params.quiz_id}/add_question`,
      JSON.stringify(this.params.questions),
    );
  }
}

export class QuizAddQuestionsTool extends BaseDeclarativeTool<
  QuizAddQuestionsParams,
  ToolResult
> {
  static readonly Name = QUIZ_ADD_QUESTIONS_TOOL_NAME;
  constructor(messageBus: MessageBus) {
    super(
      QuizAddQuestionsTool.Name,
      'AddQuizQuestions',
      QUIZ_ADD_QUESTIONS_DEFINITION.base.description!,
      Kind.Execute,
      QUIZ_ADD_QUESTIONS_DEFINITION.base.parametersJsonSchema,
      messageBus,
    );
  }
  override getSchema(modelId?: string) {
    return resolveToolDeclaration(QUIZ_ADD_QUESTIONS_DEFINITION, modelId);
  }
  protected createInvocation(
    params: QuizAddQuestionsParams,
    messageBus: MessageBus,
    _toolName?: string,
    _displayName?: string,
  ) {
    return new QuizAddQuestionsToolInvocation(
      params,
      messageBus,
      _toolName,
      _displayName,
    );
  }
}

// ---------------------------------------------------------------------------
// QuizRemoveQuestionsTool
// ---------------------------------------------------------------------------

interface QuizRemoveQuestionsParams {
  quiz_id: number;
  question_ids: number[];
}

class QuizRemoveQuestionsToolInvocation extends BaseToolInvocation<
  QuizRemoveQuestionsParams,
  ToolResult
> {
  getDescription(): string {
    return `Removing ${this.params.question_ids.length} question(s) from quiz #${this.params.quiz_id}`;
  }

  async execute(_signal: AbortSignal): Promise<ToolResult> {
    return callPrepxApi(
      'PUT',
      `/agent/quiz/${this.params.quiz_id}/remove_question`,
      JSON.stringify(this.params.question_ids),
    );
  }
}

export class QuizRemoveQuestionsTool extends BaseDeclarativeTool<
  QuizRemoveQuestionsParams,
  ToolResult
> {
  static readonly Name = QUIZ_REMOVE_QUESTIONS_TOOL_NAME;
  constructor(messageBus: MessageBus) {
    super(
      QuizRemoveQuestionsTool.Name,
      'RemoveQuizQuestions',
      QUIZ_REMOVE_QUESTIONS_DEFINITION.base.description!,
      Kind.Execute,
      QUIZ_REMOVE_QUESTIONS_DEFINITION.base.parametersJsonSchema,
      messageBus,
    );
  }
  override getSchema(modelId?: string) {
    return resolveToolDeclaration(QUIZ_REMOVE_QUESTIONS_DEFINITION, modelId);
  }
  protected createInvocation(
    params: QuizRemoveQuestionsParams,
    messageBus: MessageBus,
    _toolName?: string,
    _displayName?: string,
  ) {
    return new QuizRemoveQuestionsToolInvocation(
      params,
      messageBus,
      _toolName,
      _displayName,
    );
  }
}
