import { db } from '$lib/server/db';
import { companies, contacts, deals, activities } from '$lib/server/db/schema';
import { eq, count, sum, desc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [companyCount] = await db.select({ count: count() }).from(companies);
	const [contactCount] = await db.select({ count: count() }).from(contacts);
	const [dealCount] = await db.select({ count: count() }).from(deals);
	const [pipelineValue] = await db.select({ total: sum(deals.value) }).from(deals).where(
		eq(deals.stage, 'won')
	);

	const recentDeals = await db
		.select({
			id: deals.id,
			title: deals.title,
			value: deals.value,
			stage: deals.stage,
			companyName: companies.name
		})
		.from(deals)
		.leftJoin(companies, eq(deals.companyId, companies.id))
		.orderBy(desc(deals.createdAt))
		.limit(5);

	const recentActivities = await db
		.select({
			id: activities.id,
			type: activities.type,
			subject: activities.subject,
			date: activities.date,
			contactFirstName: contacts.firstName,
			contactLastName: contacts.lastName
		})
		.from(activities)
		.leftJoin(contacts, eq(activities.contactId, contacts.id))
		.orderBy(desc(activities.date))
		.limit(5);

	return {
		stats: {
			companies: companyCount.count,
			contacts: contactCount.count,
			deals: dealCount.count,
			wonValue: pipelineValue.total ?? '0'
		},
		recentDeals,
		recentActivities
	};
};
