-- Migration: 001_initial_schema
-- Date: 2026-04-06
-- Version: 0.1.0
-- Description: Initial database schema - companies, contacts, deals, activities, users

-- Enums
CREATE TYPE "public"."activity_type" AS ENUM('call', 'email', 'meeting', 'note');
CREATE TYPE "public"."deal_stage" AS ENUM('lead', 'qualified', 'proposal', 'negotiation', 'won', 'lost');
CREATE TYPE "public"."industry_segment" AS ENUM('oil_gas', 'renewables', 'utilities', 'nuclear', 'mining', 'government', 'other');

-- Users
CREATE TABLE "users" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "name" varchar(255) NOT NULL,
    "email" varchar(255) NOT NULL,
    "role" varchar(100),
    "created_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "users_email_unique" UNIQUE("email")
);

-- Companies
CREATE TABLE "companies" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "name" varchar(255) NOT NULL,
    "industry_segment" "industry_segment",
    "website" varchar(500),
    "phone" varchar(50),
    "address" text,
    "notes" text,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Contacts
CREATE TABLE "contacts" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "first_name" varchar(255) NOT NULL,
    "last_name" varchar(255) NOT NULL,
    "email" varchar(255),
    "phone" varchar(50),
    "job_title" varchar(255),
    "company_id" uuid,
    "notes" text,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Deals
CREATE TABLE "deals" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "title" varchar(255) NOT NULL,
    "value" numeric(12, 2),
    "stage" "deal_stage" DEFAULT 'lead' NOT NULL,
    "expected_close_date" date,
    "company_id" uuid,
    "contact_id" uuid,
    "owner_id" uuid,
    "description" text,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Activities (contact_id is nullable in v0.1.0)
CREATE TABLE "activities" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "type" "activity_type" NOT NULL,
    "subject" varchar(255) NOT NULL,
    "notes" text,
    "date" timestamp DEFAULT now() NOT NULL,
    "contact_id" uuid,
    "deal_id" uuid,
    "user_id" uuid,
    "created_at" timestamp DEFAULT now() NOT NULL
);

-- Foreign keys
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "deals" ADD CONSTRAINT "deals_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "deals" ADD CONSTRAINT "deals_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "deals" ADD CONSTRAINT "deals_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "activities" ADD CONSTRAINT "activities_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "activities" ADD CONSTRAINT "activities_deal_id_deals_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "activities" ADD CONSTRAINT "activities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
