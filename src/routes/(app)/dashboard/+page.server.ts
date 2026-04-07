import { db } from '$lib/server/db';
import { companies, contacts, deals, activities, tasks } from '$lib/server/db/schema';
import { eq, count, sum, desc, asc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
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

	// Upcoming tasks (todo only)
	const upcomingTasksQuery = db
		.select({
			id: tasks.id,
			title: tasks.title,
			dueDate: tasks.dueDate,
			dealId: tasks.dealId,
			dealTitle: deals.title
		})
		.from(tasks)
		.leftJoin(deals, eq(tasks.dealId, deals.id))
		.where(eq(tasks.status, 'todo'))
		.orderBy(asc(tasks.dueDate))
		.limit(10);

	// Sales users only see their own tasks
	const upcomingTasks = locals.user?.role !== 'admin' && locals.user
		? await db
			.select({
				id: tasks.id,
				title: tasks.title,
				dueDate: tasks.dueDate,
				dealId: tasks.dealId,
				dealTitle: deals.title
			})
			.from(tasks)
			.leftJoin(deals, eq(tasks.dealId, deals.id))
			.where(eq(tasks.status, 'todo'))
			.orderBy(asc(tasks.dueDate))
			.limit(10)
		: await upcomingTasksQuery;

	return {
		stats: {
			companies: companyCount.count,
			contacts: contactCount.count,
			deals: dealCount.count,
			wonValue: pipelineValue.total ?? '0'
		},
		recentDeals,
		recentActivities,
		upcomingTasks
	};
};
