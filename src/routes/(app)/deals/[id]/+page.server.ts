import { db } from '$lib/server/db';
import { deals, companies, contacts, activities } from '$lib/server/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const [deal] = await db
		.select({
			id: deals.id,
			title: deals.title,
			value: deals.value,
			stage: deals.stage,
			expectedCloseDate: deals.expectedCloseDate,
			description: deals.description,
			companyId: deals.companyId,
			contactId: deals.contactId,
			ownerId: deals.ownerId,
			companyName: companies.name,
			contactFirstName: contacts.firstName,
			contactLastName: contacts.lastName,
			createdAt: deals.createdAt,
			updatedAt: deals.updatedAt
		})
		.from(deals)
		.leftJoin(companies, eq(deals.companyId, companies.id))
		.leftJoin(contacts, eq(deals.contactId, contacts.id))
		.where(eq(deals.id, params.id));

	if (!deal) {
		throw error(404, 'Deal not found');
	}

	// Sales users can only see their own deals
	if (locals.user?.role !== 'admin' && deal.ownerId && deal.ownerId !== locals.user?.id) {
		throw error(403, 'Access denied');
	}

	const dealActivities = await db
		.select({
			id: activities.id,
			type: activities.type,
			subject: activities.subject,
			notes: activities.notes,
			date: activities.date,
			contactId: activities.contactId,
			dealId: activities.dealId,
			contactFirstName: contacts.firstName,
			contactLastName: contacts.lastName
		})
		.from(activities)
		.leftJoin(contacts, eq(activities.contactId, contacts.id))
		.where(eq(activities.dealId, params.id))
		.orderBy(desc(activities.date));

	const allContacts = await db
		.select({ id: contacts.id, firstName: contacts.firstName, lastName: contacts.lastName })
		.from(contacts)
		.orderBy(contacts.lastName);

	return { deal, activities: dealActivities, contacts: allContacts };
};

export const actions: Actions = {
	createActivity: async ({ request, params, locals }) => {
		const formData = await request.formData();
		const type = formData.get('type') as any;
		const subject = formData.get('subject') as string;
		const notes = formData.get('notes') as string;
		const date = formData.get('date') as string;
		const contactId = formData.get('contactId') as string;

		if (!subject?.trim() || !contactId) {
			return fail(400, { error: 'Subject and contact are required' });
		}

		await db.insert(activities).values({
			type: type || 'note',
			subject: subject.trim(),
			notes: notes?.trim() || null,
			date: date ? new Date(date) : new Date(),
			contactId,
			dealId: params.id,
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
