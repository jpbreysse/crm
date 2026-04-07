import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { count } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [result] = await db.select({ count: count() }).from(users);
	return { hasUsers: result.count > 0 };
};
