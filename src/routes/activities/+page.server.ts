import { db } from '$lib/server/db';
import { activities, contacts, deals, companies } from '$lib/server/db/schema';
import { desc, eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
	const allActivities = await db
		.select({
			id: activities.id,
			type: activities.type,
			subject: activities.subject,
			notes: activities.notes,
			date: activities.date,
			contactId: activities.contactId,
			dealId: activities.dealId,
			contactFirstName: contacts.firstName,
			contactLastName: contacts.lastName,
			dealTitle: deals.title,
			companyName: companies.name,
			createdAt: activities.createdAt
		})
		.from(activities)
		.leftJoin(contacts, eq(activities.contactId, contacts.id))
		.leftJoin(deals, eq(activities.dealId, deals.id))
		.leftJoin(companies, eq(deals.companyId, companies.id))
		.orderBy(desc(activities.date));

	const allContacts = await db
		.select({ id: contacts.id, firstName: contacts.firstName, lastName: contacts.lastName })
		.from(contacts)
		.orderBy(contacts.lastName);

	const allDeals = await db
		.select({ id: deals.id, title: deals.title })
		.from(deals)
		.orderBy(deals.title);

	return { activities: allActivities, contacts: allContacts, deals: allDeals };
};

export const actions: Actions = {
	create: async ({ request }) => {
		const formData = await request.formData();
		const type = formData.get('type') as any;
		const subject = formData.get('subject') as string;
		const notes = formData.get('notes') as string;
		const date = formData.get('date') as string;
		const contactId = formData.get('contactId') as string;
		const dealId = formData.get('dealId') as string;

		if (!subject?.trim() || !contactId) {
			return fail(400, { error: 'Subject and contact are required' });
		}

		await db.insert(activities).values({
			type: type || 'note',
			subject: subject.trim(),
			notes: notes?.trim() || null,
			date: date ? new Date(date) : new Date(),
			contactId,
			dealId: dealId || null
		});

		return { success: true };
	},

	update: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;
		const type = formData.get('type') as any;
		const subject = formData.get('subject') as string;
		const notes = formData.get('notes') as string;
		const date = formData.get('date') as string;
		const contactId = formData.get('contactId') as string;
		const dealId = formData.get('dealId') as string;

		if (!id || !subject?.trim() || !contactId) {
			return fail(400, { error: 'Subject and contact are required' });
		}

		await db.update(activities).set({
			type: type || 'note',
			subject: subject.trim(),
			notes: notes?.trim() || null,
			date: date ? new Date(date) : new Date(),
			contactId,
			dealId: dealId || null
		}).where(eq(activities.id, id));

		return { success: true };
	},

	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;

		if (!id) {
			return fail(400, { error: 'Activity ID is required' });
		}

		await db.delete(activities).where(eq(activities.id, id));

		return { success: true };
	}
};
