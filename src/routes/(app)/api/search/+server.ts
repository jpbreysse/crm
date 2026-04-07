import { db } from '$lib/server/db';
import { companies, contacts, deals } from '$lib/server/db/schema';
import { ilike, or, eq, and, desc } from 'drizzle-orm';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
	const q = url.searchParams.get('q')?.trim();

	if (!q || q.length < 2) {
		return json({ companies: [], contacts: [], deals: [] });
	}

	const pattern = `%${q}%`;

	const matchedCompanies = await db
		.select({ id: companies.id, name: companies.name, industrySegment: companies.industrySegment })
		.from(companies)
		.where(ilike(companies.name, pattern))
		.orderBy(companies.name)
		.limit(5);

	const matchedContacts = await db
		.select({
			id: contacts.id,
			firstName: contacts.firstName,
			lastName: contacts.lastName,
			email: contacts.email,
			jobTitle: contacts.jobTitle
		})
		.from(contacts)
		.where(
			or(
				ilike(contacts.firstName, pattern),
				ilike(contacts.lastName, pattern),
				ilike(contacts.email, pattern)
			)
		)
		.orderBy(contacts.lastName)
		.limit(5);

	// Deals — sales users only see their own
	const isSales = locals.user?.role !== 'admin';
	const dealFilter = isSales && locals.user
		? and(ilike(deals.title, pattern), eq(deals.ownerId, locals.user.id))
		: ilike(deals.title, pattern);

	const matchedDeals = await db
		.select({
			id: deals.id,
			title: deals.title,
			stage: deals.stage,
			companyName: companies.name
		})
		.from(deals)
		.leftJoin(companies, eq(deals.companyId, companies.id))
		.where(dealFilter)
		.orderBy(desc(deals.createdAt))
		.limit(5);

	return json({
		companies: matchedCompanies,
		contacts: matchedContacts,
		deals: matchedDeals
	});
};
