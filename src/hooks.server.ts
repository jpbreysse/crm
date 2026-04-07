import { auth } from '$lib/server/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { building } from '$app/environment';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const session = await auth.api.getSession({
		headers: event.request.headers
	});

	if (session) {
		event.locals.user = {
			id: session.user.id,
			name: session.user.name,
			email: session.user.email,
			role: (session.user as any).role ?? null
		};
		event.locals.session = {
			id: session.session.id,
			expiresAt: session.session.expiresAt
		};
	} else {
		event.locals.user = null;
		event.locals.session = null;
	}

	return svelteKitHandler({ event, resolve, auth, building });
};
