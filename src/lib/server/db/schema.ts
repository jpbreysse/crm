import { pgTable, uuid, varchar, text, numeric, date, timestamp, boolean, pgEnum, index } from 'drizzle-orm/pg-core';

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

// ── Better Auth tables ──────────────────────────────────────────────

export const users = pgTable('users', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: boolean('email_verified').default(false).notNull(),
	image: text('image'),
	role: text('role'),
	banned: boolean('banned').default(false),
	banReason: text('ban_reason'),
	banExpires: timestamp('ban_expires'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull()
});

export const sessions = pgTable('sessions', {
	id: text('id').primaryKey(),
	expiresAt: timestamp('expires_at').notNull(),
	token: text('token').notNull().unique(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').$onUpdate(() => new Date()).notNull(),
	ipAddress: text('ip_address'),
	userAgent: text('user_agent'),
	userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
	impersonatedBy: text('impersonated_by')
}, (table) => [index('sessions_userId_idx').on(table.userId)]);

export const accounts = pgTable('accounts', {
	id: text('id').primaryKey(),
	accountId: text('account_id').notNull(),
	providerId: text('provider_id').notNull(),
	userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
	accessToken: text('access_token'),
	refreshToken: text('refresh_token'),
	idToken: text('id_token'),
	accessTokenExpiresAt: timestamp('access_token_expires_at'),
	refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
	scope: text('scope'),
	password: text('password'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').$onUpdate(() => new Date()).notNull()
}, (table) => [index('accounts_userId_idx').on(table.userId)]);

export const verifications = pgTable('verifications', {
	id: text('id').primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: timestamp('expires_at').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull()
}, (table) => [index('verifications_identifier_idx').on(table.identifier)]);

// ── CRM tables ──────────────────────────────────────────────────────

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
	ownerId: text('owner_id').references(() => users.id),
	description: text('description'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const taskStatusEnum = pgEnum('task_status', ['todo', 'done']);

export const tasks = pgTable('tasks', {
	id: uuid('id').primaryKey().defaultRandom(),
	title: varchar('title', { length: 255 }).notNull(),
	description: text('description'),
	dueDate: date('due_date'),
	status: taskStatusEnum('status').notNull().default('todo'),
	dealId: uuid('deal_id').references(() => deals.id),
	contactId: uuid('contact_id').references(() => contacts.id),
	assignedTo: text('assigned_to').references(() => users.id),
	createdBy: text('created_by').references(() => users.id),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const companyNotes = pgTable('company_notes', {
	id: uuid('id').primaryKey().defaultRandom(),
	content: text('content').notNull(),
	companyId: uuid('company_id').references(() => companies.id).notNull(),
	createdBy: text('created_by').references(() => users.id),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const activities = pgTable('activities', {
	id: uuid('id').primaryKey().defaultRandom(),
	type: activityTypeEnum('type').notNull(),
	subject: varchar('subject', { length: 255 }).notNull(),
	notes: text('notes'),
	date: timestamp('date').defaultNow().notNull(),
	contactId: uuid('contact_id').references(() => contacts.id).notNull(),
	dealId: uuid('deal_id').references(() => deals.id),
	userId: text('user_id').references(() => users.id),
	createdAt: timestamp('created_at').defaultNow().notNull()
});
