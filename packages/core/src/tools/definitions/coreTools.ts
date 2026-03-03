/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Orchestrator for tool definitions.
 * Resolves the correct toolset based on model family and provides legacy exports.
 */

import type { ToolDefinition, CoreToolSet } from './types.js';
import { getToolFamily } from './modelFamilyService.js';
import { DEFAULT_LEGACY_SET } from './model-family-sets/default-legacy.js';
import { GEMINI_3_SET } from './model-family-sets/gemini-3.js';
import {
  getShellDeclaration,
  getExitPlanModeDeclaration,
  getActivateSkillDeclaration,
} from './dynamic-declaration-helpers.js';

// Re-export names for compatibility
export {
  GLOB_TOOL_NAME,
  GREP_TOOL_NAME,
  LS_TOOL_NAME,
  READ_FILE_TOOL_NAME,
  SHELL_TOOL_NAME,
  WRITE_FILE_TOOL_NAME,
  EDIT_TOOL_NAME,
  WEB_SEARCH_TOOL_NAME,
  WRITE_TODOS_TOOL_NAME,
  WEB_FETCH_TOOL_NAME,
  READ_MANY_FILES_TOOL_NAME,
  MEMORY_TOOL_NAME,
  GET_INTERNAL_DOCS_TOOL_NAME,
  ACTIVATE_SKILL_TOOL_NAME,
  ASK_USER_TOOL_NAME,
  EXIT_PLAN_MODE_TOOL_NAME,
  ENTER_PLAN_MODE_TOOL_NAME,
  // Shared parameter names
  PARAM_FILE_PATH,
  PARAM_DIR_PATH,
  PARAM_PATTERN,
  PARAM_CASE_SENSITIVE,
  PARAM_RESPECT_GIT_IGNORE,
  PARAM_RESPECT_GEMINI_IGNORE,
  PARAM_FILE_FILTERING_OPTIONS,
  PARAM_DESCRIPTION,
  // Tool-specific parameter names
  READ_FILE_PARAM_START_LINE,
  READ_FILE_PARAM_END_LINE,
  WRITE_FILE_PARAM_CONTENT,
  GREP_PARAM_INCLUDE_PATTERN,
  GREP_PARAM_EXCLUDE_PATTERN,
  GREP_PARAM_NAMES_ONLY,
  GREP_PARAM_MAX_MATCHES_PER_FILE,
  GREP_PARAM_TOTAL_MAX_MATCHES,
  GREP_PARAM_FIXED_STRINGS,
  GREP_PARAM_CONTEXT,
  GREP_PARAM_AFTER,
  GREP_PARAM_BEFORE,
  GREP_PARAM_NO_IGNORE,
  EDIT_PARAM_INSTRUCTION,
  EDIT_PARAM_OLD_STRING,
  EDIT_PARAM_NEW_STRING,
  EDIT_PARAM_ALLOW_MULTIPLE,
  LS_PARAM_IGNORE,
  SHELL_PARAM_COMMAND,
  SHELL_PARAM_IS_BACKGROUND,
  WEB_SEARCH_PARAM_QUERY,
  WEB_FETCH_PARAM_PROMPT,
  READ_MANY_PARAM_INCLUDE,
  READ_MANY_PARAM_EXCLUDE,
  READ_MANY_PARAM_RECURSIVE,
  READ_MANY_PARAM_USE_DEFAULT_EXCLUDES,
  MEMORY_PARAM_FACT,
  TODOS_PARAM_TODOS,
  TODOS_ITEM_PARAM_DESCRIPTION,
  TODOS_ITEM_PARAM_STATUS,
  DOCS_PARAM_PATH,
  ASK_USER_PARAM_QUESTIONS,
  ASK_USER_QUESTION_PARAM_QUESTION,
  ASK_USER_QUESTION_PARAM_HEADER,
  ASK_USER_QUESTION_PARAM_TYPE,
  ASK_USER_QUESTION_PARAM_OPTIONS,
  ASK_USER_QUESTION_PARAM_MULTI_SELECT,
  ASK_USER_QUESTION_PARAM_PLACEHOLDER,
  ASK_USER_OPTION_PARAM_LABEL,
  ASK_USER_OPTION_PARAM_DESCRIPTION,
  PLAN_MODE_PARAM_REASON,
  EXIT_PLAN_PARAM_PLAN_PATH,
  SKILL_PARAM_NAME,
} from './base-declarations.js';

// Re-export sets for compatibility
export { DEFAULT_LEGACY_SET } from './model-family-sets/default-legacy.js';
export { GEMINI_3_SET } from './model-family-sets/gemini-3.js';

export const TEXTBOOK_RAG_TOOL_NAME = 'textbook_rag';

export const NOTE_CREATE_TOOL_NAME = 'note_create';
export const NOTE_UPDATE_TOOL_NAME = 'note_update';
export const NOTE_GET_TOOL_NAME = 'note_get';

export const QUIZ_CREATE_TOOL_NAME = 'quiz_create';
export const QUIZ_UPDATE_TOOL_NAME = 'quiz_update';
export const QUIZ_GET_TOOL_NAME = 'quiz_get';
export const QUIZ_ADD_QUESTIONS_TOOL_NAME = 'quiz_add_questions';
export const QUIZ_REMOVE_QUESTIONS_TOOL_NAME = 'quiz_remove_questions';

export const WORKSHEET_CREATE_TOOL_NAME = 'worksheet_create';
export const WORKSHEET_UPDATE_TOOL_NAME = 'worksheet_update';
export const WORKSHEET_GET_TOOL_NAME = 'worksheet_get';
export const WORKSHEET_ADD_QUESTIONS_TOOL_NAME = 'worksheet_add_questions';
export const WORKSHEET_REMOVE_QUESTIONS_TOOL_NAME =
  'worksheet_remove_questions';

export const FLASHCARD_CREATE_TOOL_NAME = 'flashcard_create';
export const FLASHCARD_UPDATE_TOOL_NAME = 'flashcard_update';
export const FLASHCARD_GET_TOOL_NAME = 'flashcard_get';
export const FLASHCARD_ADD_QUESTIONS_TOOL_NAME = 'flashcard_add_questions';
export const FLASHCARD_REMOVE_QUESTIONS_TOOL_NAME =
  'flashcard_remove_questions';

export const QUESTION_UPDATE_TOOL_NAME = 'question_update';

/**
 * Resolves the appropriate tool set for a given model ID.
 */
export function getToolSet(modelId?: string): CoreToolSet {
  const family = getToolFamily(modelId);

  switch (family) {
    case 'gemini-3':
      return GEMINI_3_SET;
    case 'default-legacy':
    default:
      return DEFAULT_LEGACY_SET;
  }
}

// ============================================================================
// TOOL DEFINITIONS (LEGACY EXPORTS)
// ============================================================================

export const READ_FILE_DEFINITION: ToolDefinition = {
  get base() {
    return DEFAULT_LEGACY_SET.read_file;
  },
  overrides: (modelId) => getToolSet(modelId).read_file,
};

export const WRITE_FILE_DEFINITION: ToolDefinition = {
  get base() {
    return DEFAULT_LEGACY_SET.write_file;
  },
  overrides: (modelId) => getToolSet(modelId).write_file,
};

export const GREP_DEFINITION: ToolDefinition = {
  get base() {
    return DEFAULT_LEGACY_SET.grep_search;
  },
  overrides: (modelId) => getToolSet(modelId).grep_search,
};

export const RIP_GREP_DEFINITION: ToolDefinition = {
  get base() {
    return DEFAULT_LEGACY_SET.grep_search_ripgrep;
  },
  overrides: (modelId) => getToolSet(modelId).grep_search_ripgrep,
};

export const WEB_SEARCH_DEFINITION: ToolDefinition = {
  get base() {
    return DEFAULT_LEGACY_SET.google_web_search;
  },
  overrides: (modelId) => getToolSet(modelId).google_web_search,
};

export const EDIT_DEFINITION: ToolDefinition = {
  get base() {
    return DEFAULT_LEGACY_SET.replace;
  },
  overrides: (modelId) => getToolSet(modelId).replace,
};

export const GLOB_DEFINITION: ToolDefinition = {
  get base() {
    return DEFAULT_LEGACY_SET.glob;
  },
  overrides: (modelId) => getToolSet(modelId).glob,
};

export const LS_DEFINITION: ToolDefinition = {
  get base() {
    return DEFAULT_LEGACY_SET.list_directory;
  },
  overrides: (modelId) => getToolSet(modelId).list_directory,
};

export const WEB_FETCH_DEFINITION: ToolDefinition = {
  get base() {
    return DEFAULT_LEGACY_SET.web_fetch;
  },
  overrides: (modelId) => getToolSet(modelId).web_fetch,
};

export const READ_MANY_FILES_DEFINITION: ToolDefinition = {
  get base() {
    return DEFAULT_LEGACY_SET.read_many_files;
  },
  overrides: (modelId) => getToolSet(modelId).read_many_files,
};

export const MEMORY_DEFINITION: ToolDefinition = {
  get base() {
    return DEFAULT_LEGACY_SET.save_memory;
  },
  overrides: (modelId) => getToolSet(modelId).save_memory,
};

export const WRITE_TODOS_DEFINITION: ToolDefinition = {
  get base() {
    return DEFAULT_LEGACY_SET.write_todos;
  },
  overrides: (modelId) => getToolSet(modelId).write_todos,
};

export const GET_INTERNAL_DOCS_DEFINITION: ToolDefinition = {
  get base() {
    return DEFAULT_LEGACY_SET.get_internal_docs;
  },
  overrides: (modelId) => getToolSet(modelId).get_internal_docs,
};

export const ASK_USER_DEFINITION: ToolDefinition = {
  get base() {
    return DEFAULT_LEGACY_SET.ask_user;
  },
  overrides: (modelId) => getToolSet(modelId).ask_user,
};

export const ENTER_PLAN_MODE_DEFINITION: ToolDefinition = {
  get base() {
    return DEFAULT_LEGACY_SET.enter_plan_mode;
  },
  overrides: (modelId) => getToolSet(modelId).enter_plan_mode,
};

// ============================================================================
// DYNAMIC TOOL DEFINITIONS (LEGACY EXPORTS)
// ============================================================================

export {
  getShellToolDescription,
  getCommandDescription,
} from './dynamic-declaration-helpers.js';

export function getShellDefinition(
  enableInteractiveShell: boolean,
  enableEfficiency: boolean,
): ToolDefinition {
  return {
    base: getShellDeclaration(enableInteractiveShell, enableEfficiency),
    overrides: (modelId) =>
      getToolSet(modelId).run_shell_command(
        enableInteractiveShell,
        enableEfficiency,
      ),
  };
}

export function getExitPlanModeDefinition(plansDir: string): ToolDefinition {
  return {
    base: getExitPlanModeDeclaration(plansDir),
    overrides: (modelId) => getToolSet(modelId).exit_plan_mode(plansDir),
  };
}

export function getActivateSkillDefinition(
  skillNames: string[],
): ToolDefinition {
  return {
    base: getActivateSkillDeclaration(skillNames),
    overrides: (modelId) => getToolSet(modelId).activate_skill(skillNames),
  };
}

// ============================================================================
// TEXTBOOK_RAG TOOL
// ============================================================================

export const TEXTBOOK_RAG_DEFINITION: ToolDefinition = {
  base: {
    name: TEXTBOOK_RAG_TOOL_NAME,
    description: `Performs a RAG search on the textbook in vector database to find relevant topics and chapters. This helps the agent to find the right topic and chapter to answer the user's question. But mainly it is used to find related and pre-requisite topics and chapters for study material creation.`,
    parametersJsonSchema: {
      type: 'object',
      required: ['query'],
      properties: {
        query: {
          type: 'string',
          description: 'The query to search for.',
        },
      },
    },
  },
};

// ============================================================================
// CREATE_NOTE TOOL
// ============================================================================

export const NOTE_CREATE_DEFINITION: ToolDefinition = {
  base: {
    name: NOTE_CREATE_TOOL_NAME,
    description: `Creates a new note by sending it to the PrepX API. This will draft, submit, and publish the note. Returns the created note object with its ID.`,
    parametersJsonSchema: {
      type: 'object',
      required: ['topic_id', 'note', 'title'],
      properties: {
        topic_id: {
          type: 'number',
          description: 'The ID of the topic this note belongs to.',
        },
        title: {
          type: 'string',
          description: 'The title of the note.',
        },
        note: {
          type: 'string',
          description:
            'The full note content (markdown). This is the main body of the note.',
        },
        image_url: {
          type: 'string',
          description: 'Optional header/cover image URL.',
        },
        group_ids: {
          type: 'array',
          items: { type: 'number' },
          description: 'List of group IDs this note should be associated with.',
        },
      },
    },
  },
};

// ============================================================================
// UPDATE_NOTE TOOL
// ============================================================================

export const NOTE_UPDATE_DEFINITION: ToolDefinition = {
  base: {
    name: NOTE_UPDATE_TOOL_NAME,
    description: `Updates an existing note by its ID. This will re-draft, submit, and publish the note internally.`,
    parametersJsonSchema: {
      type: 'object',
      required: ['note_id'],
      properties: {
        note_id: {
          type: 'number',
          description: 'The ID of the note to update.',
        },
        topic_id: {
          type: 'number',
          description: 'The ID of the topic this note belongs to.',
        },
        title: {
          type: 'string',
          description: 'The title of the note.',
        },
        note: {
          type: 'string',
          description: 'The full note content (markdown).',
        },
        image_url: {
          type: 'string',
          description: 'Optional header/cover image URL.',
        },
        group_ids: {
          type: 'array',
          items: { type: 'number' },
          description: 'List of group IDs this note should be associated with.',
        },
      },
    },
  },
};

// ============================================================================
// GET_NOTE TOOL
// ============================================================================

export const NOTE_GET_DEFINITION: ToolDefinition = {
  base: {
    name: NOTE_GET_TOOL_NAME,
    description: `Retrieves a note by its ID from the PrepX API. Returns the full note object including topic_id, title, note content, status, and image_url.`,
    parametersJsonSchema: {
      type: 'object',
      required: ['note_id'],
      properties: {
        note_id: {
          type: 'number',
          description: 'The ID of the note to retrieve.',
        },
      },
    },
  },
};

// ============================================================================
// QUESTION TOOLS
// ============================================================================

const commonQuestionProperties = {
  question_text: { type: 'string' },
  question_image: { type: 'string' },
  question_images: { type: 'array', items: { type: 'string' } },
  question_type: {
    type: 'string',
    enum: ['multiple_choice', 'true_false', 'flashcard'],
  },
  question_table: { type: 'string' },
  choices: {
    type: 'array',
    items: {
      type: 'object',
      required: ['choice_text', 'is_correct'],
      properties: {
        choice_text: { type: 'string' },
        is_correct: { type: 'boolean' },
        choice_image: { type: 'string' },
        extra_data: { type: 'object' },
      },
    },
  },
  difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] },
  extra_data: { type: 'object' },
  tags: { type: 'array', items: { type: 'string' } },
  learning_objective: { type: 'string' },
  bloom_level: {
    type: 'string',
    enum: ['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'],
  },
  prerequisite_concepts: { type: 'array', items: { type: 'string' } },
  hint: { type: 'string' },
  solution_text: { type: 'string' },
  solution_image: { type: 'string' },
  solution_video: { type: 'string' },
  version: { type: 'number' },
};

const questionSchemaBase = {
  type: 'object',
  required: ['question_text', 'question_type', 'choices'],
  properties: {
    exam_id: { type: 'number' },
    ...commonQuestionProperties,
  },
};

export const QUESTION_UPDATE_DEFINITION: ToolDefinition = {
  base: {
    name: QUESTION_UPDATE_TOOL_NAME,
    description: `Updates a single question by its ID.`,
    parametersJsonSchema: {
      type: 'object',
      required: ['question_id'],
      properties: {
        question_id: { type: 'number' },
        exam_id: { type: 'number' },
        ...commonQuestionProperties,
      },
    },
  },
};

// ============================================================================
// QUIZ TOOLS
// ============================================================================

export const QUIZ_CREATE_DEFINITION: ToolDefinition = {
  base: {
    name: QUIZ_CREATE_TOOL_NAME,
    description: `Creates a new quiz, drafting it along with its questions, and internally submits and publishes it.`,
    parametersJsonSchema: {
      type: 'object',
      required: ['title', 'group_ids', 'questions'],
      properties: {
        title: { type: 'string', description: 'The title of the quiz.' },
        topic_id: { type: 'number', description: 'The ID of the topic.' },
        group_ids: {
          type: 'array',
          items: { type: 'number' },
          description:
            'Group IDs that will be targeted by the quiz. If empty, the quiz will be published to all groups.',
        },
        questions: { type: 'array', items: questionSchemaBase },
      },
    },
  },
};

export const QUIZ_UPDATE_DEFINITION: ToolDefinition = {
  base: {
    name: QUIZ_UPDATE_TOOL_NAME,
    description: `Updates the base details (title, topic) of a quiz.`,
    parametersJsonSchema: {
      type: 'object',
      required: ['quiz_id'],
      properties: {
        quiz_id: { type: 'number' },
        title: { type: 'string' },
        topic_id: { type: 'number' },
      },
    },
  },
};

export const QUIZ_GET_DEFINITION: ToolDefinition = {
  base: {
    name: QUIZ_GET_TOOL_NAME,
    description: `Gets a published quiz by its ID, complete with questions.`,
    parametersJsonSchema: {
      type: 'object',
      required: ['quiz_id'],
      properties: {
        quiz_id: { type: 'number' },
      },
    },
  },
};

export const QUIZ_ADD_QUESTIONS_DEFINITION: ToolDefinition = {
  base: {
    name: QUIZ_ADD_QUESTIONS_TOOL_NAME,
    description: `Appends new questions to a quiz, then submits and publishes it.`,
    parametersJsonSchema: {
      type: 'object',
      required: ['quiz_id', 'questions'],
      properties: {
        quiz_id: { type: 'number' },
        questions: { type: 'array', items: questionSchemaBase },
      },
    },
  },
};

export const QUIZ_REMOVE_QUESTIONS_DEFINITION: ToolDefinition = {
  base: {
    name: QUIZ_REMOVE_QUESTIONS_TOOL_NAME,
    description: `Removes questions by their IDs from a quiz, then submits and publishes it.`,
    parametersJsonSchema: {
      type: 'object',
      required: ['quiz_id', 'question_ids'],
      properties: {
        quiz_id: { type: 'number' },
        question_ids: { type: 'array', items: { type: 'number' } },
      },
    },
  },
};

// ============================================================================
// WORKSHEET TOOLS
// ============================================================================

export const WORKSHEET_CREATE_DEFINITION: ToolDefinition = {
  base: {
    name: WORKSHEET_CREATE_TOOL_NAME,
    description: `Creates a new worksheet, drafting it along with its questions, and internally submits and publishes it.`,
    parametersJsonSchema: {
      type: 'object',
      required: [
        'title',
        'objective',
        'worksheet_type',
        'group_ids',
        'questions',
      ],
      properties: {
        title: { type: 'string' },
        objective: { type: 'string' },
        worksheet_type: { type: 'string' },
        difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] },
        et_completion: { type: 'string' },
        group_ids: { type: 'array', items: { type: 'number' } },
        topic_ids: { type: 'array', items: { type: 'number' } },
        questions: { type: 'array', items: questionSchemaBase },
      },
    },
  },
};

export const WORKSHEET_UPDATE_DEFINITION: ToolDefinition = {
  base: {
    name: WORKSHEET_UPDATE_TOOL_NAME,
    description: `Updates the base details of a worksheet.`,
    parametersJsonSchema: {
      type: 'object',
      required: ['worksheet_id'],
      properties: {
        worksheet_id: { type: 'number' },
        title: { type: 'string' },
        objective: { type: 'string' },
        worksheet_type: { type: 'string' },
        difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] },
        topic_ids: { type: 'array', items: { type: 'number' } },
        et_completion: { type: 'string' },
      },
    },
  },
};

export const WORKSHEET_GET_DEFINITION: ToolDefinition = {
  base: {
    name: WORKSHEET_GET_TOOL_NAME,
    description: `Gets a published worksheet by its ID, complete with questions.`,
    parametersJsonSchema: {
      type: 'object',
      required: ['worksheet_id'],
      properties: {
        worksheet_id: { type: 'number' },
      },
    },
  },
};

export const WORKSHEET_ADD_QUESTIONS_DEFINITION: ToolDefinition = {
  base: {
    name: WORKSHEET_ADD_QUESTIONS_TOOL_NAME,
    description: `Appends new questions to a worksheet, then submits and publishes it.`,
    parametersJsonSchema: {
      type: 'object',
      required: ['worksheet_id', 'questions'],
      properties: {
        worksheet_id: { type: 'number' },
        questions: { type: 'array', items: questionSchemaBase },
      },
    },
  },
};

export const WORKSHEET_REMOVE_QUESTIONS_DEFINITION: ToolDefinition = {
  base: {
    name: WORKSHEET_REMOVE_QUESTIONS_TOOL_NAME,
    description: `Removes questions by their IDs from a worksheet, then submits and publishes it.`,
    parametersJsonSchema: {
      type: 'object',
      required: ['worksheet_id', 'question_ids'],
      properties: {
        worksheet_id: { type: 'number' },
        question_ids: { type: 'array', items: { type: 'number' } },
      },
    },
  },
};

// ============================================================================
// FLASHCARD TOOLS
// ============================================================================

export const FLASHCARD_CREATE_DEFINITION: ToolDefinition = {
  base: {
    name: FLASHCARD_CREATE_TOOL_NAME,
    description: `Creates a new flashcard deck, drafting it along with its questions, and internally submits and publishes it.`,
    parametersJsonSchema: {
      type: 'object',
      required: ['title', 'group_ids', 'questions'],
      properties: {
        title: { type: 'string' },
        topic_id: { type: 'number' },
        group_ids: { type: 'array', items: { type: 'number' } },
        questions: { type: 'array', items: questionSchemaBase },
      },
    },
  },
};

export const FLASHCARD_UPDATE_DEFINITION: ToolDefinition = {
  base: {
    name: FLASHCARD_UPDATE_TOOL_NAME,
    description: `Updates the base details of a flashcard deck.`,
    parametersJsonSchema: {
      type: 'object',
      required: ['flashcard_id'],
      properties: {
        flashcard_id: { type: 'number' },
        title: { type: 'string' },
        topic_id: { type: 'number' },
      },
    },
  },
};

export const FLASHCARD_GET_DEFINITION: ToolDefinition = {
  base: {
    name: FLASHCARD_GET_TOOL_NAME,
    description: `Gets a published flashcard deck by its ID, complete with questions.`,
    parametersJsonSchema: {
      type: 'object',
      required: ['flashcard_id'],
      properties: {
        flashcard_id: { type: 'number' },
      },
    },
  },
};

export const FLASHCARD_ADD_QUESTIONS_DEFINITION: ToolDefinition = {
  base: {
    name: FLASHCARD_ADD_QUESTIONS_TOOL_NAME,
    description: `Appends new questions to a flashcard deck, then submits and publishes it.`,
    parametersJsonSchema: {
      type: 'object',
      required: ['flashcard_id', 'questions'],
      properties: {
        flashcard_id: { type: 'number' },
        questions: { type: 'array', items: questionSchemaBase },
      },
    },
  },
};

export const FLASHCARD_REMOVE_QUESTIONS_DEFINITION: ToolDefinition = {
  base: {
    name: FLASHCARD_REMOVE_QUESTIONS_TOOL_NAME,
    description: `Removes questions by their IDs from a flashcard deck, then submits and publishes it.`,
    parametersJsonSchema: {
      type: 'object',
      required: ['flashcard_id', 'question_ids'],
      properties: {
        flashcard_id: { type: 'number' },
        question_ids: { type: 'array', items: { type: 'number' } },
      },
    },
  },
};
