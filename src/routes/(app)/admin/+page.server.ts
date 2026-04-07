import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { auth } from '$lib/server/auth';
import { redirect, fail } from '@sveltejs/kit';
import { desc } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user?.role !== 'admin') {
		throw redirect(303, '/dashboard');
	}

	const allUsers = await db
		.select({
			id: users.id,
			name: users.name,
			email: users.email,
			role: users.role,
			banned: users.banned,
			createdAt: users.createdAt
		})
		.from(users)
		.orderBy(desc(users.createdAt));

	return { users: allUsers };
};

export const actions: Actions = {
	createUser: async ({ request, locals, cookies }) => {
		if (locals.user?.role !== 'admin') {
			return fail(403, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const name = formData.get('name') as string;
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;
		const role = formData.get('role') as string;

		if (!name?.trim() || !email?.trim() || !password) {
			return fail(400, { error: 'Name, email, and password are required' });
		}

		try {
			const newUser = await auth.api.signUpEmail({
				body: {
					name: name.trim(),
					email: email.trim(),
					password
				}
			});

			if (role && role !== 'user') {
				await auth.api.setRole({
					body: { userId: newUser.user.id, role: role as 'admin' | 'user' },
					headers: request.headers
				});
			}
		} catch (e: any) {
			return fail(400, { error: e.message ?? 'Failed to create user' });
		}

		return { success: true };
	}
};
