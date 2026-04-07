import { db } from '$lib/server/db';
import { companies } from '$lib/server/db/schema';
import { desc, eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
	const allCompanies = await db
		.select()
		.from(companies)
		.orderBy(desc(companies.createdAt));

	return { companies: allCompanies };
};

export const actions: Actions = {
	create: async ({ request }) => {
		const formData = await request.formData();
		const name = formData.get('name') as string;
		const industrySegment = formData.get('industrySegment') as any;
		const website = formData.get('website') as string;
		const phone = formData.get('phone') as string;
		const address = formData.get('address') as string;
		const notes = formData.get('notes') as string;

		if (!name?.trim()) {
			return fail(400, { error: 'Company name is required' });
		}

		await db.insert(companies).values({
			name: name.trim(),
			industrySegment: industrySegment || null,
			website: website?.trim() || null,
			phone: phone?.trim() || null,
			address: address?.trim() || null,
			notes: notes?.trim() || null
		});

		return { success: true };
	},

	update: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;
		const name = formData.get('name') as string;
		const industrySegment = formData.get('industrySegment') as any;
		const website = formData.get('website') as string;
		const phone = formData.get('phone') as string;
		const address = formData.get('address') as string;
		const notes = formData.get('notes') as string;

		if (!id || !name?.trim()) {
			return fail(400, { error: 'Company name is required' });
		}

		await db.update(companies).set({
			name: name.trim(),
			industrySegment: industrySegment || null,
			website: website?.trim() || null,
			phone: phone?.trim() || null,
			address: address?.trim() || null,
			notes: notes?.trim() || null,
			updatedAt: new Date()
		}).where(eq(companies.id, id));

		return { success: true };
	},

	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;

		if (!id) {
			return fail(400, { error: 'Company ID is required' });
		}

		await db.delete(companies).where(eq(companies.id, id));

		return { success: true };
	}
};
