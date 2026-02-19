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

import { cwd } from 'node:process';

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
  SCAFFOLD_TOPIC_TOOL_NAME,
  VALIDATE_TOPIC_TOOL_NAME,
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

import {
  SCAFFOLD_TOPIC_TOOL_NAME,
  VALIDATE_TOPIC_TOOL_NAME,
} from './base-declarations.js';

// Re-export sets for compatibility
export { DEFAULT_LEGACY_SET } from './model-family-sets/default-legacy.js';
export { GEMINI_3_SET } from './model-family-sets/gemini-3.js';

export const TEXTBOOK_RAG_TOOL_NAME = 'textbook_rag';

export const NOTE_DRAFT_TOOL_NAME = 'note_draft';
export const NOTE_SUBMIT_TOOL_NAME = 'note_submit';
export const NOTE_PUBLISH_TOOL_NAME = 'note_publish';
export const NOTE_GET_TOOL_NAME = 'note_get';

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
// SCAFFOLD_TOPIC TOOL
// ============================================================================

export const SCAFFOLD_TOPIC_DEFINITION: ToolDefinition = {
  base: {
    name: SCAFFOLD_TOPIC_TOOL_NAME,
    description: `Scaffolds a new topic by creating a new directory and note, quiz, worksheet, and flashcard files within the ${cwd()}/topics/ directory.
      The directory structure will be as follows:
        cwd/topics/<topic_id>_<topic_name>/note.json
        cwd/topics/<topic_id>_<topic_name>/quiz.json
        cwd/topics/<topic_id>_<topic_name>/worksheet_1.json
        cwd/topics/<topic_id>_<topic_name>/worksheet_2.json
        cwd/topics/<topic_id>_<topic_name>/worksheet_3.json
        cwd/topics/<topic_id>_<topic_name>/flashcards.json
    `,
    parametersJsonSchema: {
      type: 'object',
      required: ['topic_name', 'topic_id'],
      properties: {
        topic_name: {
          type: 'string',
          description: 'The name of the topic to scaffold.',
        },
        topic_id: {
          type: 'string',
          description: 'The ID of the topic to scaffold.',
        },
      },
    },
  },
};

// ============================================================================
// VALIDATE_CONTENT TOOL
// ============================================================================

export const VALIDATE_CONTENT_DEFINITION: ToolDefinition = {
  base: {
    name: VALIDATE_TOPIC_TOOL_NAME,
    description: `Validates the content of a topic by checking for missing or incomplete files within the ${cwd()}/topics/ directory.`,
    parametersJsonSchema: {
      type: 'object',
      required: ['topic_id'],
      properties: {
        topic_name: {
          type: 'string',
          description: 'The name of the topic to validate.',
        },
        topic_id: {
          type: 'string',
          description: 'The ID of the topic to validate.',
        },
      },
    },
  },
};

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
// DRAFT_NOTE TOOL
// ============================================================================

export const NOTE_DRAFT_DEFINITION: ToolDefinition = {
  base: {
    name: NOTE_DRAFT_TOOL_NAME,
    description: `Creates a new note draft by sending it to the PrepX API. The note will be created in "draft" status. Returns the created note object with its ID.`,
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
// SUBMIT_NOTE TOOL
// ============================================================================

export const NOTE_SUBMIT_DEFINITION: ToolDefinition = {
  base: {
    name: NOTE_SUBMIT_TOOL_NAME,
    description: `Submits a draft note for review by transitioning it from "draft" to "pending" status. The note must already exist and be in draft status.`,
    parametersJsonSchema: {
      type: 'object',
      required: ['note_id'],
      properties: {
        note_id: {
          type: 'number',
          description: 'The ID of the note to submit for review.',
        },
      },
    },
  },
};

// ============================================================================
// PUBLISH_NOTE TOOL
// ============================================================================

export const NOTE_PUBLISH_DEFINITION: ToolDefinition = {
  base: {
    name: NOTE_PUBLISH_TOOL_NAME,
    description: `Publishes a submitted note, making it visible to students. The note must be in "pending" status.`,
    parametersJsonSchema: {
      type: 'object',
      required: ['note_id'],
      properties: {
        note_id: {
          type: 'number',
          description: 'The ID of the note to publish.',
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
