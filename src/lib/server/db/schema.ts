import { pgTable, uuid, varchar, text, numeric, date, timestamp, pgEnum } from 'drizzle-orm/pg-core';

// Enums
export const dealStageEnum = pgEnum('deal_stage', [
	'lead',
	'qualified',
	'proposal',
	'negotiation',
	'won',
	'lost'
]);

export const activityTypeEnum = pgEnum('activity_type', [
	'call',
	'email',
	'meeting',
	'note'
]);

export const industrySegmentEnum = pgEnum('industry_segment', [
	'oil_gas',
	'renewables',
	'utilities',
	'nuclear',
	'mining',
	'government',
	'other'
]);

// Tables
export const users = pgTable('users', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: varchar('name', { length: 255 }).notNull(),
	email: varchar('email', { length: 255 }).notNull().unique(),
	role: varchar('role', { length: 100 }),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const companies = pgTable('companies', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: varchar('name', { length: 255 }).notNull(),
	industrySegment: industrySegmentEnum('industry_segment'),
	website: varchar('website', { length: 500 }),
	phone: varchar('phone', { length: 50 }),
	address: text('address'),
	notes: text('notes'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const contacts = pgTable('contacts', {
	id: uuid('id').primaryKey().defaultRandom(),
	firstName: varchar('first_name', { length: 255 }).notNull(),
	lastName: varchar('last_name', { length: 255 }).notNull(),
	email: varchar('email', { length: 255 }),
	phone: varchar('phone', { length: 50 }),
	jobTitle: varchar('job_title', { length: 255 }),
	companyId: uuid('company_id').references(() => companies.id),
	notes: text('notes'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const deals = pgTable('deals', {
	id: uuid('id').primaryKey().defaultRandom(),
	title: varchar('title', { length: 255 }).notNull(),
	value: numeric('value', { precision: 12, scale: 2 }),
	stage: dealStageEnum('stage').notNull().default('lead'),
	expectedCloseDate: date('expected_close_date'),
	companyId: uuid('company_id').references(() => companies.id),
	contactId: uuid('contact_id').references(() => contacts.id),
	ownerId: uuid('owner_id').references(() => users.id),
	description: text('description'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const activities = pgTable('activities', {
	id: uuid('id').primaryKey().defaultRandom(),
	type: activityTypeEnum('type').notNull(),
	subject: varchar('subject', { length: 255 }).notNull(),
	notes: text('notes'),
	date: timestamp('date').defaultNow().notNull(),
	contactId: uuid('contact_id').references(() => contacts.id),
	dealId: uuid('deal_id').references(() => deals.id),
	userId: uuid('user_id').references(() => users.id),
	createdAt: timestamp('created_at').defaultNow().notNull()
});
