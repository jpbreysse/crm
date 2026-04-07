import { db } from '$lib/server/db';
import { deals, companies, contacts, users } from '$lib/server/db/schema';
import { desc, eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
	const allDeals = await db
		.select({
			id: deals.id,
			title: deals.title,
			value: deals.value,
			stage: deals.stage,
			expectedCloseDate: deals.expectedCloseDate,
			description: deals.description,
			companyId: deals.companyId,
			contactId: deals.contactId,
			companyName: companies.name,
			contactFirstName: contacts.firstName,
			contactLastName: contacts.lastName,
			createdAt: deals.createdAt
		})
		.from(deals)
		.leftJoin(companies, eq(deals.companyId, companies.id))
		.leftJoin(contacts, eq(deals.contactId, contacts.id))
		.orderBy(desc(deals.createdAt));

	const allCompanies = await db.select({ id: companies.id, name: companies.name }).from(companies).orderBy(companies.name);
	const allContacts = await db
		.select({ id: contacts.id, firstName: contacts.firstName, lastName: contacts.lastName })
		.from(contacts)
		.orderBy(contacts.lastName);

	return { deals: allDeals, companies: allCompanies, contacts: allContacts };
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const formData = await request.formData();
		const title = formData.get('title') as string;
		const value = formData.get('value') as string;
		const stage = formData.get('stage') as any;
		const expectedCloseDate = formData.get('expectedCloseDate') as string;
		const companyId = formData.get('companyId') as string;
		const contactId = formData.get('contactId') as string;
		const description = formData.get('description') as string;

		if (!title?.trim()) {
			return fail(400, { error: 'Deal title is required' });
		}

		await db.insert(deals).values({
			title: title.trim(),
			value: value || null,
			stage: stage || 'lead',
			expectedCloseDate: expectedCloseDate || null,
			companyId: companyId || null,
			contactId: contactId || null,
			ownerId: locals.user?.id ?? null,
			description: description?.trim() || null
		});

		return { success: true };
	},

	update: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;
		const title = formData.get('title') as string;
		const value = formData.get('value') as string;
		const stage = formData.get('stage') as any;
		const expectedCloseDate = formData.get('expectedCloseDate') as string;
		const companyId = formData.get('companyId') as string;
		const contactId = formData.get('contactId') as string;
		const description = formData.get('description') as string;

		if (!id || !title?.trim()) {
			return fail(400, { error: 'Deal title is required' });
		}

		await db.update(deals).set({
			title: title.trim(),
			value: value || null,
			stage: stage || 'lead',
			expectedCloseDate: expectedCloseDate || null,
			companyId: companyId || null,
			contactId: contactId || null,
			description: description?.trim() || null,
			updatedAt: new Date()
		}).where(eq(deals.id, id));

		return { success: true };
	},

	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;

		if (!id) {
			return fail(400, { error: 'Deal ID is required' });
		}

		await db.delete(deals).where(eq(deals.id, id));

		return { success: true };
	}
};
