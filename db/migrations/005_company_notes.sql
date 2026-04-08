-- Migration: 005_company_notes
-- Date: 2026-04-08
-- Version: 0.4.0
-- Description: Add company_notes table for notes timeline per company.

CREATE TABLE "company_notes" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "content" text NOT NULL,
    "company_id" uuid NOT NULL REFERENCES "public"."companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    "created_by" text REFERENCES "public"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);
