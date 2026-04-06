-- Migration: 002_activity_contact_required
-- Date: 2026-04-06
-- Version: 0.2.0
-- Description: Make contact_id required on activities.
--              Every activity must be linked to a contact (person).
--              Deal remains optional.
--
-- Prerequisites: No activities with NULL contact_id should exist.
--                If they do, assign them a contact before running this migration:
--                UPDATE activities SET contact_id = '<some-contact-uuid>' WHERE contact_id IS NULL;

ALTER TABLE "activities" ALTER COLUMN "contact_id" SET NOT NULL;
