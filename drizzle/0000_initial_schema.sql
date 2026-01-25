CREATE TYPE "public"."attempt_mode" AS ENUM('practice', 'tryout');--> statement-breakpoint
CREATE TYPE "public"."attempt_status" AS ENUM('in_progress', 'completed', 'abandoned');--> statement-breakpoint
CREATE TYPE "public"."content_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TYPE "public"."difficulty" AS ENUM('easy', 'medium', 'hard');--> statement-breakpoint
CREATE TYPE "public"."exam_type" AS ENUM('utbk', 'tka');--> statement-breakpoint
CREATE TYPE "public"."question_type" AS ENUM('single_choice', 'complex_selection', 'fill_in');--> statement-breakpoint
CREATE TYPE "public"."time_mode" AS ENUM('relaxed', 'timed');--> statement-breakpoint
CREATE TABLE "attempt_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attempt_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"user_answer" jsonb,
	"is_correct" boolean,
	"partial_score" integer,
	"time_spent_seconds" integer,
	"answered_at" timestamp with time zone,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"section_index" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"mode" "attempt_mode" NOT NULL,
	"status" "attempt_status" DEFAULT 'in_progress' NOT NULL,
	"time_mode" time_mode DEFAULT 'relaxed' NOT NULL,
	"subtest_id" uuid,
	"question_set_id" uuid,
	"blueprint_id" uuid,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"total_time_seconds" integer,
	"config_snapshot" jsonb,
	"results" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blueprint_sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"blueprint_id" uuid NOT NULL,
	"subtest_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"question_count" integer NOT NULL,
	"duration_seconds" integer NOT NULL,
	"countdown_seconds" integer DEFAULT 30 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blueprints" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"exam_id" uuid NOT NULL,
	"version" varchar(20) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(20) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"type" "exam_type" NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "exams_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"full_name" varchar(255),
	"school" varchar(255),
	"avatar_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "question_set_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_set_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "question_sets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"exam_id" uuid NOT NULL,
	"subtest_id" uuid,
	"name" varchar(255) NOT NULL,
	"description" text,
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subtest_id" uuid NOT NULL,
	"stimulus" text,
	"stem" text NOT NULL,
	"options" jsonb,
	"complex_options" jsonb,
	"question_type" "question_type" NOT NULL,
	"answer_key" jsonb NOT NULL,
	"explanation" jsonb NOT NULL,
	"difficulty" "difficulty" DEFAULT 'medium',
	"topic_tags" jsonb DEFAULT '[]'::jsonb,
	"source_year" integer,
	"source_info" varchar(255),
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subtests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"exam_id" uuid NOT NULL,
	"code" varchar(20) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_mandatory" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "attempt_items" ADD CONSTRAINT "attempt_items_attempt_id_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."attempts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempt_items" ADD CONSTRAINT "attempt_items_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_subtest_id_subtests_id_fk" FOREIGN KEY ("subtest_id") REFERENCES "public"."subtests"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_question_set_id_question_sets_id_fk" FOREIGN KEY ("question_set_id") REFERENCES "public"."question_sets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_blueprint_id_blueprints_id_fk" FOREIGN KEY ("blueprint_id") REFERENCES "public"."blueprints"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blueprint_sections" ADD CONSTRAINT "blueprint_sections_blueprint_id_blueprints_id_fk" FOREIGN KEY ("blueprint_id") REFERENCES "public"."blueprints"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blueprint_sections" ADD CONSTRAINT "blueprint_sections_subtest_id_subtests_id_fk" FOREIGN KEY ("subtest_id") REFERENCES "public"."subtests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blueprints" ADD CONSTRAINT "blueprints_exam_id_exams_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_set_items" ADD CONSTRAINT "question_set_items_question_set_id_question_sets_id_fk" FOREIGN KEY ("question_set_id") REFERENCES "public"."question_sets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_set_items" ADD CONSTRAINT "question_set_items_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_sets" ADD CONSTRAINT "question_sets_exam_id_exams_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_sets" ADD CONSTRAINT "question_sets_subtest_id_subtests_id_fk" FOREIGN KEY ("subtest_id") REFERENCES "public"."subtests"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_subtest_id_subtests_id_fk" FOREIGN KEY ("subtest_id") REFERENCES "public"."subtests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subtests" ADD CONSTRAINT "subtests_exam_id_exams_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "attempt_items_attempt_id_idx" ON "attempt_items" USING btree ("attempt_id");--> statement-breakpoint
CREATE INDEX "attempt_items_question_id_idx" ON "attempt_items" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "attempt_items_attempt_sort_idx" ON "attempt_items" USING btree ("attempt_id","sort_order");--> statement-breakpoint
CREATE INDEX "attempt_items_question_correct_idx" ON "attempt_items" USING btree ("question_id","is_correct");--> statement-breakpoint
CREATE INDEX "attempts_user_id_idx" ON "attempts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "attempts_user_created_idx" ON "attempts" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "attempts_status_idx" ON "attempts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "attempts_subtest_id_idx" ON "attempts" USING btree ("subtest_id");--> statement-breakpoint
CREATE INDEX "attempts_mode_idx" ON "attempts" USING btree ("mode");--> statement-breakpoint
CREATE INDEX "blueprint_sections_blueprint_id_idx" ON "blueprint_sections" USING btree ("blueprint_id");--> statement-breakpoint
CREATE INDEX "blueprint_sections_sort_idx" ON "blueprint_sections" USING btree ("blueprint_id","sort_order");--> statement-breakpoint
CREATE INDEX "blueprints_exam_id_idx" ON "blueprints" USING btree ("exam_id");--> statement-breakpoint
CREATE INDEX "blueprints_version_idx" ON "blueprints" USING btree ("version");--> statement-breakpoint
CREATE INDEX "profiles_email_idx" ON "profiles" USING btree ("email");--> statement-breakpoint
CREATE INDEX "question_set_items_set_id_idx" ON "question_set_items" USING btree ("question_set_id");--> statement-breakpoint
CREATE INDEX "question_set_items_sort_idx" ON "question_set_items" USING btree ("question_set_id","sort_order");--> statement-breakpoint
CREATE INDEX "question_sets_exam_id_idx" ON "question_sets" USING btree ("exam_id");--> statement-breakpoint
CREATE INDEX "question_sets_subtest_id_idx" ON "question_sets" USING btree ("subtest_id");--> statement-breakpoint
CREATE INDEX "question_sets_status_idx" ON "question_sets" USING btree ("status");--> statement-breakpoint
CREATE INDEX "questions_subtest_id_idx" ON "questions" USING btree ("subtest_id");--> statement-breakpoint
CREATE INDEX "questions_status_idx" ON "questions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "questions_difficulty_idx" ON "questions" USING btree ("difficulty");--> statement-breakpoint
CREATE INDEX "questions_type_idx" ON "questions" USING btree ("question_type");--> statement-breakpoint
CREATE INDEX "questions_subtest_status_idx" ON "questions" USING btree ("subtest_id","status");--> statement-breakpoint
CREATE INDEX "subtests_exam_id_idx" ON "subtests" USING btree ("exam_id");--> statement-breakpoint
CREATE INDEX "subtests_code_idx" ON "subtests" USING btree ("code");