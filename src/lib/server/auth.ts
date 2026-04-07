import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin } from 'better-auth/plugins';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { building } from '$app/environment';
import { db } from './db';
import * as schema from './db/schema';

function createAuth() {
	return betterAuth({
		secret: process.env.BETTER_AUTH_SECRET,
		baseURL: process.env.BETTER_AUTH_URL,
		database: drizzleAdapter(db, {
			provider: 'pg',
			usePlural: true,
			schema
		}),
		emailAndPassword: {
			enabled: true
		},
		plugins: [
			admin(),
			sveltekitCookies(getRequestEvent)
		]
	});
}

// Don't initialize during build — env vars aren't available
export const auth = building ? (null as unknown as ReturnType<typeof createAuth>) : createAuth();
