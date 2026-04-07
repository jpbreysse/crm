import { db } from '$lib/server/db';
import { contacts, companies } from '$lib/server/db/schema';
import { desc, eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
	const allContacts = await db
		.select({
			id: contacts.id,
			firstName: contacts.firstName,
			lastName: contacts.lastName,
			email: contacts.email,
			phone: contacts.phone,
			jobTitle: contacts.jobTitle,
			companyId: contacts.companyId,
			companyName: companies.name,
			createdAt: contacts.createdAt
		})
		.from(contacts)
		.leftJoin(companies, eq(contacts.companyId, companies.id))
		.orderBy(desc(contacts.createdAt));

	const allCompanies = await db.select({ id: companies.id, name: companies.name }).from(companies).orderBy(companies.name);

	return { contacts: allContacts, companies: allCompanies };
};

export const actions: Actions = {
	create: async ({ request }) => {
		const formData = await request.formData();
		const firstName = formData.get('firstName') as string;
		const lastName = formData.get('lastName') as string;
		const email = formData.get('email') as string;
		const phone = formData.get('phone') as string;
		const jobTitle = formData.get('jobTitle') as string;
		const companyId = formData.get('companyId') as string;
		const notes = formData.get('notes') as string;

		if (!firstName?.trim() || !lastName?.trim()) {
			return fail(400, { error: 'First and last name are required' });
		}

		await db.insert(contacts).values({
			firstName: firstName.trim(),
			lastName: lastName.trim(),
			email: email?.trim() || null,
			phone: phone?.trim() || null,
			jobTitle: jobTitle?.trim() || null,
			companyId: companyId || null,
			notes: notes?.trim() || null
		});

		return { success: true };
	},

	update: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;
		const firstName = formData.get('firstName') as string;
		const lastName = formData.get('lastName') as string;
		const email = formData.get('email') as string;
		const phone = formData.get('phone') as string;
		const jobTitle = formData.get('jobTitle') as string;
		const companyId = formData.get('companyId') as string;
		const notes = formData.get('notes') as string;

		if (!id || !firstName?.trim() || !lastName?.trim()) {
			return fail(400, { error: 'First and last name are required' });
		}

		await db.update(contacts).set({
			firstName: firstName.trim(),
			lastName: lastName.trim(),
			email: email?.trim() || null,
			phone: phone?.trim() || null,
			jobTitle: jobTitle?.trim() || null,
			companyId: companyId || null,
			notes: notes?.trim() || null,
			updatedAt: new Date()
		}).where(eq(contacts.id, id));

		return { success: true };
	},

	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;

		if (!id) {
			return fail(400, { error: 'Contact ID is required' });
		}

		await db.delete(contacts).where(eq(contacts.id, id));

		return { success: true };
	}
};
