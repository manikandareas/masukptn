/**
 * Database Schema for UTBK/TKA Practice Platform
 *
 * MVP Tables:
 * - profiles: User profiles (extends Supabase auth.users)
 * - exams: Exam types (UTBK, TKA)
 * - subtests: Subtests/subjects per exam
 * - questions: Question bank with markdown content
 * - blueprints: Versioned exam structure configurations
 * - blueprint_sections: Sections within blueprints
 * - question_sets: Curated question bundles
 * - question_set_items: Questions within sets
 * - attempts: User practice/tryout sessions
 * - attempt_items: Per-question answers and timing
 */

import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// ============================================================================
// ENUMS
// ============================================================================

export const examTypeEnum = pgEnum("exam_type", ["utbk", "tka"]);

export const questionTypeEnum = pgEnum("question_type", [
  "single_choice", // A-E single selection
  "complex_selection", // Table-based multi-row selection
  "fill_in", // Short answer/rumpang
]);

export const difficultyEnum = pgEnum("difficulty", ["easy", "medium", "hard"]);

export const attemptModeEnum = pgEnum("attempt_mode", ["practice", "tryout"]);

export const attemptStatusEnum = pgEnum("attempt_status", [
  "in_progress",
  "completed",
  "abandoned",
]);

export const timeModeEnum = pgEnum("time_mode", ["relaxed", "timed"]);

export const contentStatusEnum = pgEnum("content_status", [
  "draft",
  "published",
]);

// ============================================================================
// HELPER: Timestamps
// ============================================================================

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
};

// ============================================================================
// PROFILES (extends Supabase auth.users)
// ============================================================================

export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id").primaryKey(), // References auth.users.id
    email: varchar("email", { length: 255 }).notNull(),
    fullName: varchar("full_name", { length: 255 }),
    school: varchar("school", { length: 255 }),
    avatarUrl: text("avatar_url"),
    ...timestamps,
  },
  (table) => [index("profiles_email_idx").on(table.email)],
);

// ============================================================================
// EXAMS (UTBK, TKA)
// ============================================================================

export const exams = pgTable("exams", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: varchar("code", { length: 20 }).notNull().unique(), // 'utbk', 'tka'
  name: varchar("name", { length: 100 }).notNull(), // 'UTBK SNBT', 'TKA'
  description: text("description"),
  type: examTypeEnum("type").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  ...timestamps,
});

// ============================================================================
// SUBTESTS / SUBJECTS
// ============================================================================

export const subtests = pgTable(
  "subtests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    examId: uuid("exam_id")
      .notNull()
      .references(() => exams.id, { onDelete: "cascade" }),
    code: varchar("code", { length: 20 }).notNull(), // 'pu', 'ppu', 'pbm', etc.
    name: varchar("name", { length: 100 }).notNull(), // 'Penalaran Umum'
    description: text("description"),
    sortOrder: integer("sort_order").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    isMandatory: boolean("is_mandatory").default(true).notNull(), // For TKA electives
    ...timestamps,
  },
  (table) => [
    index("subtests_exam_id_idx").on(table.examId),
    index("subtests_code_idx").on(table.code),
  ],
);

// ============================================================================
// QUESTIONS
// ============================================================================

/**
 * Answer key structure varies by question type:
 *
 * single_choice: { correct: "A" }
 * complex_selection: { rows: [{ correct: "benar" }, { correct: "salah" }, ...] }
 * fill_in: { accepted: ["answer1", "answer2"], caseSensitive: false, regex?: "pattern" }
 */
export type AnswerKey =
  | { type: "single_choice"; correct: string }
  | { type: "complex_selection"; rows: Array<{ correct: string }> }
  | {
      type: "fill_in";
      accepted: string[];
      caseSensitive?: boolean;
      regex?: string;
    };

/**
 * Explanation structure:
 * - level1: Brief rationale (required for published)
 * - level2: Step-by-step solution (optional, for math/logic)
 */
export type Explanation = {
  level1: string; // Markdown: why correct answer is correct
  level1WrongOptions?: Record<string, string>; // Markdown per wrong option: { "A": "Why A is wrong", ... }
  level2?: string[]; // Array of steps in markdown
};

export const questions = pgTable(
  "questions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    subtestId: uuid("subtest_id")
      .notNull()
      .references(() => subtests.id, { onDelete: "cascade" }),

    // Content (markdown)
    stimulus: text("stimulus"), // Long passage/context (optional)
    stem: text("stem").notNull(), // The actual question
    options: jsonb("options").$type<string[]>(), // For choice questions: ["A. Option", "B. Option", ...]
    complexOptions:
      jsonb("complex_options").$type<
        Array<{ statement: string; choices: string[] }>
      >(), // For complex selection

    // Answer & Explanation
    questionType: questionTypeEnum("question_type").notNull(),
    answerKey: jsonb("answer_key").$type<AnswerKey>().notNull(),
    explanation: jsonb("explanation").$type<Explanation>().notNull(),

    // Metadata
    difficulty: difficultyEnum("difficulty").default("medium"),
    topicTags: jsonb("topic_tags").$type<string[]>().default([]),
    sourceYear: integer("source_year"), // e.g., 2024
    sourceInfo: varchar("source_info", { length: 255 }), // e.g., "UTBK 2024 Paket A"

    // Status
    status: contentStatusEnum("status").default("draft").notNull(),

    ...timestamps,
  },
  (table) => [
    index("questions_subtest_id_idx").on(table.subtestId),
    index("questions_status_idx").on(table.status),
    index("questions_difficulty_idx").on(table.difficulty),
    index("questions_type_idx").on(table.questionType),
    // For filtering published questions by subtest
    index("questions_subtest_status_idx").on(table.subtestId, table.status),
  ],
);

// ============================================================================
// BLUEPRINTS (Versioned Exam Structures)
// ============================================================================

export const blueprints = pgTable(
  "blueprints",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    examId: uuid("exam_id")
      .notNull()
      .references(() => exams.id, { onDelete: "cascade" }),
    version: varchar("version", { length: 20 }).notNull(), // e.g., '2025', '2026'
    name: varchar("name", { length: 100 }).notNull(), // 'UTBK 2025'
    description: text("description"),
    isActive: boolean("is_active").default(true).notNull(),
    ...timestamps,
  },
  (table) => [
    index("blueprints_exam_id_idx").on(table.examId),
    index("blueprints_version_idx").on(table.version),
  ],
);

// ============================================================================
// BLUEPRINT SECTIONS
// ============================================================================

export const blueprintSections = pgTable(
  "blueprint_sections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    blueprintId: uuid("blueprint_id")
      .notNull()
      .references(() => blueprints.id, { onDelete: "cascade" }),
    subtestId: uuid("subtest_id")
      .notNull()
      .references(() => subtests.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 100 }).notNull(), // Display name for section
    sortOrder: integer("sort_order").default(0).notNull(),
    questionCount: integer("question_count").notNull(), // Number of questions
    durationSeconds: integer("duration_seconds").notNull(), // Time limit in seconds
    countdownSeconds: integer("countdown_seconds").default(30).notNull(), // Pre-section countdown
    ...timestamps,
  },
  (table) => [
    index("blueprint_sections_blueprint_id_idx").on(table.blueprintId),
    index("blueprint_sections_sort_idx").on(table.blueprintId, table.sortOrder),
  ],
);

// ============================================================================
// QUESTION SETS (Curated Bundles)
// ============================================================================

export const questionSets = pgTable(
  "question_sets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    examId: uuid("exam_id")
      .notNull()
      .references(() => exams.id, { onDelete: "cascade" }),
    subtestId: uuid("subtest_id").references(() => subtests.id, {
      onDelete: "set null",
    }), // Optional: for subtest-specific sets
    name: varchar("name", { length: 255 }).notNull(), // 'UTBK Mixed Set 01'
    description: text("description"),
    status: contentStatusEnum("status").default("draft").notNull(),
    ...timestamps,
  },
  (table) => [
    index("question_sets_exam_id_idx").on(table.examId),
    index("question_sets_subtest_id_idx").on(table.subtestId),
    index("question_sets_status_idx").on(table.status),
  ],
);

// ============================================================================
// QUESTION SET ITEMS (Link Table)
// ============================================================================

export const questionSetItems = pgTable(
  "question_set_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    questionSetId: uuid("question_set_id")
      .notNull()
      .references(() => questionSets.id, { onDelete: "cascade" }),
    questionId: uuid("question_id")
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").default(0).notNull(),
    ...timestamps,
  },
  (table) => [
    index("question_set_items_set_id_idx").on(table.questionSetId),
    index("question_set_items_sort_idx").on(
      table.questionSetId,
      table.sortOrder,
    ),
  ],
);

// ============================================================================
// ATTEMPTS (Practice/Tryout Sessions)
// ============================================================================

export const attempts = pgTable(
  "attempts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),

    // Session type
    mode: attemptModeEnum("mode").notNull(), // practice or tryout
    status: attemptStatusEnum("status").default("in_progress").notNull(),
    timeMode: timeModeEnum("time_mode").default("relaxed").notNull(), // For practice

    // Context (one of these will be set)
    subtestId: uuid("subtest_id").references(() => subtests.id, {
      onDelete: "set null",
    }), // For practice by subtest
    questionSetId: uuid("question_set_id").references(() => questionSets.id, {
      onDelete: "set null",
    }), // For practice by set
    blueprintId: uuid("blueprint_id").references(() => blueprints.id, {
      onDelete: "set null",
    }), // For tryout

    // Timing (server-authoritative for tryout)
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    totalTimeSeconds: integer("total_time_seconds"), // Actual time spent

    // Config snapshot (for resumability)
    configSnapshot: jsonb("config_snapshot").$type<{
      questionCount?: number;
      timeLimitSeconds?: number;
      currentSectionIndex?: number;
      sectionStartedAt?: string;
    }>(),

    // Results (populated on completion)
    results: jsonb("results").$type<{
      totalQuestions: number;
      correctCount: number;
      wrongCount: number;
      blankCount: number;
      accuracy: number;
      avgTimePerQuestion: number;
      perSection?: Array<{
        subtestId: string;
        subtestName: string;
        correct: number;
        total: number;
        accuracy: number;
        timeSeconds: number;
      }>;
    }>(),

    ...timestamps,
  },
  (table) => [
    index("attempts_user_id_idx").on(table.userId),
    index("attempts_user_created_idx").on(table.userId, table.createdAt),
    index("attempts_status_idx").on(table.status),
    index("attempts_subtest_id_idx").on(table.subtestId),
    index("attempts_mode_idx").on(table.mode),
  ],
);

// ============================================================================
// ATTEMPT ITEMS (Per-Question Answers)
// ============================================================================

export const attemptItems = pgTable(
  "attempt_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    attemptId: uuid("attempt_id")
      .notNull()
      .references(() => attempts.id, { onDelete: "cascade" }),
    questionId: uuid("question_id")
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),

    // Answer (structure depends on question type)
    userAnswer: jsonb("user_answer").$type<
      | { type: "single_choice"; selected: string | null }
      | { type: "complex_selection"; rows: Array<{ selected: string | null }> }
      | { type: "fill_in"; value: string | null }
    >(),

    // Grading
    isCorrect: boolean("is_correct"),
    partialScore: integer("partial_score"), // For complex selection (0-100)

    // Timing
    timeSpentSeconds: integer("time_spent_seconds"),
    answeredAt: timestamp("answered_at", { withTimezone: true }),

    // Position in attempt
    sortOrder: integer("sort_order").default(0).notNull(),
    sectionIndex: integer("section_index"), // For tryout sections

    ...timestamps,
  },
  (table) => [
    index("attempt_items_attempt_id_idx").on(table.attemptId),
    index("attempt_items_question_id_idx").on(table.questionId),
    index("attempt_items_attempt_sort_idx").on(
      table.attemptId,
      table.sortOrder,
    ),
    // For analytics: finding all attempts for a specific question
    index("attempt_items_question_correct_idx").on(
      table.questionId,
      table.isCorrect,
    ),
  ],
);

// ============================================================================
// RELATIONS
// ============================================================================

export const profilesRelations = relations(profiles, ({ many }) => ({
  attempts: many(attempts),
}));

export const examsRelations = relations(exams, ({ many }) => ({
  subtests: many(subtests),
  blueprints: many(blueprints),
  questionSets: many(questionSets),
}));

export const subtestsRelations = relations(subtests, ({ one, many }) => ({
  exam: one(exams, {
    fields: [subtests.examId],
    references: [exams.id],
  }),
  questions: many(questions),
  blueprintSections: many(blueprintSections),
  questionSets: many(questionSets),
  attempts: many(attempts),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  subtest: one(subtests, {
    fields: [questions.subtestId],
    references: [subtests.id],
  }),
  questionSetItems: many(questionSetItems),
  attemptItems: many(attemptItems),
}));

export const blueprintsRelations = relations(blueprints, ({ one, many }) => ({
  exam: one(exams, {
    fields: [blueprints.examId],
    references: [exams.id],
  }),
  sections: many(blueprintSections),
  attempts: many(attempts),
}));

export const blueprintSectionsRelations = relations(
  blueprintSections,
  ({ one }) => ({
    blueprint: one(blueprints, {
      fields: [blueprintSections.blueprintId],
      references: [blueprints.id],
    }),
    subtest: one(subtests, {
      fields: [blueprintSections.subtestId],
      references: [subtests.id],
    }),
  }),
);

export const questionSetsRelations = relations(
  questionSets,
  ({ one, many }) => ({
    exam: one(exams, {
      fields: [questionSets.examId],
      references: [exams.id],
    }),
    subtest: one(subtests, {
      fields: [questionSets.subtestId],
      references: [subtests.id],
    }),
    items: many(questionSetItems),
    attempts: many(attempts),
  }),
);

export const questionSetItemsRelations = relations(
  questionSetItems,
  ({ one }) => ({
    questionSet: one(questionSets, {
      fields: [questionSetItems.questionSetId],
      references: [questionSets.id],
    }),
    question: one(questions, {
      fields: [questionSetItems.questionId],
      references: [questions.id],
    }),
  }),
);

export const attemptsRelations = relations(attempts, ({ one, many }) => ({
  user: one(profiles, {
    fields: [attempts.userId],
    references: [profiles.id],
  }),
  subtest: one(subtests, {
    fields: [attempts.subtestId],
    references: [subtests.id],
  }),
  questionSet: one(questionSets, {
    fields: [attempts.questionSetId],
    references: [questionSets.id],
  }),
  blueprint: one(blueprints, {
    fields: [attempts.blueprintId],
    references: [blueprints.id],
  }),
  items: many(attemptItems),
}));

export const attemptItemsRelations = relations(attemptItems, ({ one }) => ({
  attempt: one(attempts, {
    fields: [attemptItems.attemptId],
    references: [attempts.id],
  }),
  question: one(questions, {
    fields: [attemptItems.questionId],
    references: [questions.id],
  }),
}));
