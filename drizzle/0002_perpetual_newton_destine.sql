ALTER TABLE "question_imports" ADD COLUMN "queue_message_id" varchar(255);--> statement-breakpoint
ALTER TABLE "question_imports" ADD COLUMN "queue_deduplication_id" varchar(255);