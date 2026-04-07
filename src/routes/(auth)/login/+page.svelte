<script lang="ts">
	import { authClient } from '$lib/auth-client';
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Card from '$lib/components/ui/card';

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleLogin(e: Event) {
		e.preventDefault();
		error = '';
		loading = true;

		const result = await authClient.signIn.email({
			email,
			password
		});

		if (result.error) {
			error = result.error.message ?? 'Invalid credentials';
			loading = false;
		} else {
			goto('/dashboard');
		}
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Sign In</Card.Title>
		<Card.Description>Enter your credentials to access the CRM.</Card.Description>
	</Card.Header>
	<Card.Content>
		{#if error}
			<p class="mb-4 text-sm text-destructive">{error}</p>
		{/if}
		<form onsubmit={handleLogin} class="space-y-4">
			<div class="space-y-2">
				<Label for="email">Email</Label>
				<Input id="email" type="email" bind:value={email} required />
			</div>
			<div class="space-y-2">
				<Label for="password">Password</Label>
				<Input id="password" type="password" bind:value={password} required />
			</div>
			<Button type="submit" class="w-full" disabled={loading}>
				{loading ? 'Signing in...' : 'Sign In'}
			</Button>
		</form>
		<p class="mt-4 text-center text-sm text-muted-foreground">
			No account? <a href="/register" class="underline hover:text-foreground">Register</a>
		</p>
	</Card.Content>
</Card.Root>
