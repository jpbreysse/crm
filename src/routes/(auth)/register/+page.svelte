<script lang="ts">
	import { authClient } from '$lib/auth-client';
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Card from '$lib/components/ui/card';

	let { data } = $props();

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleRegister(e: Event) {
		e.preventDefault();
		error = '';
		loading = true;

		const result = await authClient.signUp.email({
			name,
			email,
			password
		});

		if (result.error) {
			error = result.error.message ?? 'Registration failed';
			loading = false;
		} else {
			// If this is the first user, make them admin
			if (!data.hasUsers) {
				await authClient.admin.setRole({ userId: result.data!.user.id, role: 'admin' });
			}
			goto('/dashboard');
		}
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>{data.hasUsers ? 'Register' : 'Create Admin Account'}</Card.Title>
		<Card.Description>
			{data.hasUsers
				? 'Create your account to access the CRM.'
				: 'No users exist yet. This will be the admin account.'}
		</Card.Description>
	</Card.Header>
	<Card.Content>
		{#if error}
			<p class="mb-4 text-sm text-destructive">{error}</p>
		{/if}
		<form onsubmit={handleRegister} class="space-y-4">
			<div class="space-y-2">
				<Label for="name">Full Name</Label>
				<Input id="name" bind:value={name} required />
			</div>
			<div class="space-y-2">
				<Label for="email">Email</Label>
				<Input id="email" type="email" bind:value={email} required />
			</div>
			<div class="space-y-2">
				<Label for="password">Password</Label>
				<Input id="password" type="password" bind:value={password} required minlength={8} />
			</div>
			<Button type="submit" class="w-full" disabled={loading}>
				{loading ? 'Creating account...' : data.hasUsers ? 'Register' : 'Create Admin Account'}
			</Button>
		</form>
		<p class="mt-4 text-center text-sm text-muted-foreground">
			Already have an account? <a href="/login" class="underline hover:text-foreground">Sign in</a>
		</p>
	</Card.Content>
</Card.Root>
