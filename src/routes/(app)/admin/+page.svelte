<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Badge } from '$lib/components/ui/badge';

	let { data, form } = $props();
	let showForm = $state(false);

	$effect(() => {
		if (form?.success) {
			showForm = false;
		}
	});
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<h1 class="text-3xl font-bold">User Management</h1>
		<Button onclick={() => (showForm = !showForm)}>
			{showForm ? 'Cancel' : '+ New User'}
		</Button>
	</div>

	{#if showForm}
		<Card.Root>
			<Card.Header>
				<Card.Title class="text-xl">Create User</Card.Title>
			</Card.Header>
			<Card.Content>
				{#if form?.error}
					<p class="mb-4 text-sm text-destructive">{form.error}</p>
				{/if}
				<form method="POST" action="?/createUser" class="grid gap-4 sm:grid-cols-2">
					<div class="space-y-2">
						<Label for="name">Full Name *</Label>
						<Input id="name" name="name" required />
					</div>
					<div class="space-y-2">
						<Label for="email">Email *</Label>
						<Input id="email" name="email" type="email" required />
					</div>
					<div class="space-y-2">
						<Label for="password">Password *</Label>
						<Input id="password" name="password" type="password" required minlength={8} />
					</div>
					<div class="space-y-2">
						<Label for="role">Role</Label>
						<select id="role" name="role" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
							<option value="user">Sales</option>
							<option value="admin">Admin</option>
						</select>
					</div>
					<div class="sm:col-span-2">
						<Button type="submit">Create User</Button>
					</div>
				</form>
			</Card.Content>
		</Card.Root>
	{/if}

	<Card.Root>
		<Card.Content class="p-0">
			{#if data.users.length === 0}
				<p class="p-6 text-sm text-muted-foreground">No users yet.</p>
			{:else}
				<table class="w-full">
					<thead>
						<tr class="border-b text-left text-sm text-muted-foreground">
							<th class="p-4 font-medium">Name</th>
							<th class="p-4 font-medium">Email</th>
							<th class="p-4 font-medium">Role</th>
							<th class="p-4 font-medium">Status</th>
						</tr>
					</thead>
					<tbody>
						{#each data.users as user}
							<tr class="border-b last:border-0 hover:bg-muted/50">
								<td class="p-4 font-medium">{user.name}</td>
								<td class="p-4 text-sm text-muted-foreground">{user.email}</td>
								<td class="p-4">
									<Badge variant={user.role === 'admin' ? 'default' : 'outline'}>
										{user.role === 'admin' ? 'Admin' : 'Sales'}
									</Badge>
								</td>
								<td class="p-4">
									{#if user.banned}
										<Badge variant="destructive">Banned</Badge>
									{:else}
										<Badge variant="secondary">Active</Badge>
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}
		</Card.Content>
	</Card.Root>
</div>
