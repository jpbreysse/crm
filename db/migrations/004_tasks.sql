-- Migration: 004_tasks
-- Date: 2026-04-07
-- Version: 0.3.0
-- Description: Add tasks/to-dos for deals.
--              Tasks track follow-up actions with due dates and completion status.

CREATE TYPE "public"."task_status" AS ENUM('todo', 'done');

CREATE TABLE "tasks" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "title" varchar(255) NOT NULL,
    "description" text,
    "due_date" date,
    "status" "task_status" DEFAULT 'todo' NOT NULL,
    "deal_id" uuid REFERENCES "public"."deals"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    "contact_id" uuid REFERENCES "public"."contacts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    "assigned_to" text REFERENCES "public"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    "created_by" text REFERENCES "public"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);
