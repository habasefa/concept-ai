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
import { QUESTION_UPDATE_TOOL_NAME } from './tool-names.js';
import { QUESTION_UPDATE_DEFINITION } from './definitions/coreTools.js';

// ---------------------------------------------------------------------------
// QuestionUpdateTool
// ---------------------------------------------------------------------------

export enum QuestionType {
  multiple_choice = 'multiple_choice',
  true_false = 'true_false',
  flashcard = 'flashcard',
}

export enum Difficulty {
  easy = 'Easy',
  medium = 'Medium',
  hard = 'Hard',
}

export enum BloomLevel {
  remember = 'remember',
  understand = 'understand',
  apply = 'apply',
  analyze = 'analyze',
  evaluate = 'evaluate',
  create = 'create',
}

export interface Choice {
  choice_text: string;
  choice_image: string;
  extra_data: Record<string, unknown>;
  is_correct: boolean;
}

export interface QuestionCreateParams {
  exam_id?: number;
  question_text?: string;
  question_images?: string[];
  question_type?: QuestionType;
  question_table?: string;
  choices?: Choice[];
  difficulty?: Difficulty;
  extra_data?: Record<string, unknown>;
  tags?: string[];
  bloom_level?: BloomLevel;
  prerequisite_concepts?: string[];
  hint?: string;
  solution_text?: string;
  solution_image?: string;
}

export interface QuestionUpdateParams extends QuestionCreateParams {
  question_id: number;
}

class QuestionUpdateToolInvocation extends BaseToolInvocation<
  QuestionUpdateParams,
  ToolResult
> {
  getDescription(): string {
    return `Updating question #${this.params.question_id}`;
  }

  async execute(_signal: AbortSignal): Promise<ToolResult> {
    const { question_id, ...body } = this.params;
    return callPrepxApi(
      'PUT',
      `/agent/question/${question_id}`,
      JSON.stringify(body),
    );
  }
}

export class QuestionUpdateTool extends BaseDeclarativeTool<
  QuestionUpdateParams,
  ToolResult
> {
  static readonly Name = QUESTION_UPDATE_TOOL_NAME;
  constructor(messageBus: MessageBus) {
    super(
      QuestionUpdateTool.Name,
      'UpdateQuestion',
      QUESTION_UPDATE_DEFINITION.base.description!,
      Kind.Execute,
      QUESTION_UPDATE_DEFINITION.base.parametersJsonSchema,
      messageBus,
    );
  }
  override getSchema(modelId?: string) {
    return resolveToolDeclaration(QUESTION_UPDATE_DEFINITION, modelId);
  }
  protected createInvocation(
    params: QuestionUpdateParams,
    messageBus: MessageBus,
    _toolName?: string,
    _displayName?: string,
  ) {
    return new QuestionUpdateToolInvocation(
      params,
      messageBus,
      _toolName,
      _displayName,
    );
  }
}
