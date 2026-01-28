CREATE TYPE "public"."import_status" AS ENUM('queued', 'processing', 'ready', 'failed', 'saved');--> statement-breakpoint
CREATE TABLE "question_import_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"import_id" uuid NOT NULL,
	"subtest_id" uuid,
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
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "question_imports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_by" uuid NOT NULL,
	"source_filename" varchar(255) NOT NULL,
	"source_mime_type" varchar(120) NOT NULL,
	"source_file_size" integer NOT NULL,
	"storage_bucket" varchar(120) NOT NULL,
	"storage_path" text NOT NULL,
	"status" "import_status" DEFAULT 'queued' NOT NULL,
	"error_message" text,
	"ocr_text" text,
	"ocr_metadata" jsonb,
	"processed_at" timestamp with time zone,
	"draft_exam_id" uuid,
	"draft_subtest_id" uuid,
	"draft_name" varchar(255),
	"draft_description" text,
	"saved_question_set_id" uuid,
	"saved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "question_import_questions" ADD CONSTRAINT "question_import_questions_import_id_question_imports_id_fk" FOREIGN KEY ("import_id") REFERENCES "public"."question_imports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_import_questions" ADD CONSTRAINT "question_import_questions_subtest_id_subtests_id_fk" FOREIGN KEY ("subtest_id") REFERENCES "public"."subtests"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_imports" ADD CONSTRAINT "question_imports_created_by_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_imports" ADD CONSTRAINT "question_imports_draft_exam_id_exams_id_fk" FOREIGN KEY ("draft_exam_id") REFERENCES "public"."exams"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_imports" ADD CONSTRAINT "question_imports_draft_subtest_id_subtests_id_fk" FOREIGN KEY ("draft_subtest_id") REFERENCES "public"."subtests"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_imports" ADD CONSTRAINT "question_imports_saved_question_set_id_question_sets_id_fk" FOREIGN KEY ("saved_question_set_id") REFERENCES "public"."question_sets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "question_import_questions_import_idx" ON "question_import_questions" USING btree ("import_id");--> statement-breakpoint
CREATE INDEX "question_import_questions_subtest_idx" ON "question_import_questions" USING btree ("subtest_id");--> statement-breakpoint
CREATE INDEX "question_import_questions_sort_idx" ON "question_import_questions" USING btree ("import_id","sort_order");--> statement-breakpoint
CREATE INDEX "question_imports_status_idx" ON "question_imports" USING btree ("status");--> statement-breakpoint
CREATE INDEX "question_imports_created_by_idx" ON "question_imports" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "question_imports_created_at_idx" ON "question_imports" USING btree ("created_at");