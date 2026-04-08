import { db } from '$lib/server/db';
import { companies, companyNotes, contacts, deals, users } from '$lib/server/db/schema';
import { eq, desc, count } from 'drizzle-orm';
import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const [company] = await db
		.select()
		.from(companies)
		.where(eq(companies.id, params.id));

	if (!company) {
		throw error(404, 'Company not found');
	}

	const notes = await db
		.select({
			id: companyNotes.id,
			content: companyNotes.content,
			createdAt: companyNotes.createdAt,
			updatedAt: companyNotes.updatedAt,
			authorName: users.name
		})
		.from(companyNotes)
		.leftJoin(users, eq(companyNotes.createdBy, users.id))
		.where(eq(companyNotes.companyId, params.id))
		.orderBy(desc(companyNotes.createdAt));

	const companyContacts = await db
		.select({
			id: contacts.id,
			firstName: contacts.firstName,
			lastName: contacts.lastName,
			email: contacts.email,
			phone: contacts.phone,
			jobTitle: contacts.jobTitle
		})
		.from(contacts)
		.where(eq(contacts.companyId, params.id))
		.orderBy(contacts.lastName);

	const companyDeals = await db
		.select({
			id: deals.id,
			title: deals.title,
			value: deals.value,
			stage: deals.stage
		})
		.from(deals)
		.where(eq(deals.companyId, params.id))
		.orderBy(desc(deals.createdAt));

	return { company, notes, contacts: companyContacts, deals: companyDeals };
};

export const actions: Actions = {
	createNote: async ({ request, params, locals }) => {
		const formData = await request.formData();
		const content = formData.get('content') as string;

		if (!content?.trim()) {
			return fail(400, { error: 'Note content is required' });
		}

		await db.insert(companyNotes).values({
			content: content.trim(),
			companyId: params.id,
			createdBy: locals.user?.id ?? null
		});

		return { success: true };
	},

	updateNote: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;
		const content = formData.get('content') as string;

		if (!id || !content?.trim()) {
			return fail(400, { error: 'Note content is required' });
		}

		await db.update(companyNotes).set({
			content: content.trim(),
			updatedAt: new Date()
		}).where(eq(companyNotes.id, id));

		return { success: true };
	},

	deleteNote: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;

		if (!id) return fail(400, { error: 'Note ID is required' });

		await db.delete(companyNotes).where(eq(companyNotes.id, id));

		return { success: true };
	}
};
