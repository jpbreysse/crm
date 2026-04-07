import { db } from '$lib/server/db';
import { contacts, companies, activities, deals } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const [contact] = await db
		.select({
			id: contacts.id,
			firstName: contacts.firstName,
			lastName: contacts.lastName,
			email: contacts.email,
			phone: contacts.phone,
			jobTitle: contacts.jobTitle,
			companyId: contacts.companyId,
			companyName: companies.name,
			notes: contacts.notes,
			createdAt: contacts.createdAt
		})
		.from(contacts)
		.leftJoin(companies, eq(contacts.companyId, companies.id))
		.where(eq(contacts.id, params.id));

	if (!contact) {
		throw error(404, 'Contact not found');
	}

	const contactActivities = await db
		.select({
			id: activities.id,
			type: activities.type,
			subject: activities.subject,
			notes: activities.notes,
			date: activities.date,
			contactId: activities.contactId,
			dealId: activities.dealId,
			dealTitle: deals.title
		})
		.from(activities)
		.leftJoin(deals, eq(activities.dealId, deals.id))
		.where(eq(activities.contactId, params.id))
		.orderBy(desc(activities.date));

	const allDeals = await db
		.select({ id: deals.id, title: deals.title })
		.from(deals)
		.orderBy(deals.title);

	return { contact, activities: contactActivities, deals: allDeals };
};

export const actions: Actions = {
	createActivity: async ({ request, params, locals }) => {
		const formData = await request.formData();
		const type = formData.get('type') as any;
		const subject = formData.get('subject') as string;
		const notes = formData.get('notes') as string;
		const date = formData.get('date') as string;
		const dealId = formData.get('dealId') as string;

		if (!subject?.trim()) {
			return fail(400, { error: 'Subject is required' });
		}

		await db.insert(activities).values({
			type: type || 'note',
			subject: subject.trim(),
			notes: notes?.trim() || null,
			date: date ? new Date(date) : new Date(),
			contactId: params.id,
			dealId: dealId || null,
			userId: locals.user?.id ?? null
		});

		return { success: true };
	},

	updateActivity: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;
		const type = formData.get('type') as any;
		const subject = formData.get('subject') as string;
		const notes = formData.get('notes') as string;
		const date = formData.get('date') as string;

		if (!id || !subject?.trim()) {
			return fail(400, { error: 'Subject is required' });
		}

		await db.update(activities).set({
			type: type || 'note',
			subject: subject.trim(),
			notes: notes?.trim() || null,
			date: date ? new Date(date) : new Date()
		}).where(eq(activities.id, id));

		return { success: true };
	},

	deleteActivity: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;

		if (!id) return fail(400, { error: 'Activity ID is required' });

		await db.delete(activities).where(eq(activities.id, id));

		return { success: true };
	}
};
