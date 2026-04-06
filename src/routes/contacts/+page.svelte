<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';

	let { data, form } = $props();
	let showForm = $state(false);
	let editingId = $state<string | null>(null);
	let deletingId = $state<string | null>(null);

	function editContact(id: string) {
		editingId = id;
		showForm = false;
	}

	$effect(() => {
		if (form?.success) {
			showForm = false;
			editingId = null;
			deletingId = null;
		}
	});
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<h1 class="text-3xl font-bold">Contacts</h1>
		<Button onclick={() => { showForm = !showForm; editingId = null; }}>
			{showForm ? 'Cancel' : '+ New Contact'}
		</Button>
	</div>

	{#if showForm}
		<Card.Root>
			<Card.Header>
				<Card.Title class="text-xl">New Contact</Card.Title>
			</Card.Header>
			<Card.Content>
				{#if form?.error && !editingId}
					<p class="mb-4 text-sm text-destructive">{form.error}</p>
				{/if}
				<form method="POST" action="?/create" class="grid gap-4 sm:grid-cols-2">
					<div class="space-y-2">
						<Label for="firstName">First Name *</Label>
						<Input id="firstName" name="firstName" required />
					</div>
					<div class="space-y-2">
						<Label for="lastName">Last Name *</Label>
						<Input id="lastName" name="lastName" required />
					</div>
					<div class="space-y-2">
						<Label for="email">Email</Label>
						<Input id="email" name="email" type="email" />
					</div>
					<div class="space-y-2">
						<Label for="phone">Phone</Label>
						<Input id="phone" name="phone" type="tel" />
					</div>
					<div class="space-y-2">
						<Label for="jobTitle">Job Title</Label>
						<Input id="jobTitle" name="jobTitle" />
					</div>
					<div class="space-y-2">
						<Label for="companyId">Company</Label>
						<select
							id="companyId"
							name="companyId"
							class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
						>
							<option value="">Select...</option>
							{#each data.companies as company}
								<option value={company.id}>{company.name}</option>
							{/each}
						</select>
					</div>
					<div class="space-y-2 sm:col-span-2">
						<Label for="notes">Notes</Label>
						<Textarea id="notes" name="notes" />
					</div>
					<div class="sm:col-span-2">
						<Button type="submit">Create Contact</Button>
					</div>
				</form>
			</Card.Content>
		</Card.Root>
	{/if}

	{#if editingId}
		{@const contact = data.contacts.find((c) => c.id === editingId)}
		{#if contact}
			<Card.Root>
				<Card.Header>
					<div class="flex items-center justify-between">
						<Card.Title class="text-xl">Edit Contact</Card.Title>
						<Button variant="ghost" size="sm" onclick={() => (editingId = null)}>Cancel</Button>
					</div>
				</Card.Header>
				<Card.Content>
					{#if form?.error && editingId}
						<p class="mb-4 text-sm text-destructive">{form.error}</p>
					{/if}
					<form method="POST" action="?/update" class="grid gap-4 sm:grid-cols-2">
						<input type="hidden" name="id" value={contact.id} />
						<div class="space-y-2">
							<Label for="edit-firstName">First Name *</Label>
							<Input id="edit-firstName" name="firstName" value={contact.firstName} required />
						</div>
						<div class="space-y-2">
							<Label for="edit-lastName">Last Name *</Label>
							<Input id="edit-lastName" name="lastName" value={contact.lastName} required />
						</div>
						<div class="space-y-2">
							<Label for="edit-email">Email</Label>
							<Input id="edit-email" name="email" type="email" value={contact.email ?? ''} />
						</div>
						<div class="space-y-2">
							<Label for="edit-phone">Phone</Label>
							<Input id="edit-phone" name="phone" type="tel" value={contact.phone ?? ''} />
						</div>
						<div class="space-y-2">
							<Label for="edit-jobTitle">Job Title</Label>
							<Input id="edit-jobTitle" name="jobTitle" value={contact.jobTitle ?? ''} />
						</div>
						<div class="space-y-2">
							<Label for="edit-companyId">Company</Label>
							<select
								id="edit-companyId"
								name="companyId"
								class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
							>
								<option value="">Select...</option>
								{#each data.companies as company}
									<option value={company.id} selected={contact.companyId === company.id}>{company.name}</option>
								{/each}
							</select>
						</div>
						<div class="space-y-2 sm:col-span-2">
							<Label for="edit-notes">Notes</Label>
							<Textarea id="edit-notes" name="notes" value="" />
						</div>
						<div class="sm:col-span-2">
							<Button type="submit">Save Changes</Button>
						</div>
					</form>
				</Card.Content>
			</Card.Root>
		{/if}
	{/if}

	<Card.Root>
		<Card.Content class="p-0">
			{#if data.contacts.length === 0}
				<p class="p-6 text-sm text-muted-foreground">No contacts yet. Add your first contact to get started.</p>
			{:else}
				<table class="w-full">
					<thead>
						<tr class="border-b text-left text-sm text-muted-foreground">
							<th class="p-4 font-medium">Name</th>
							<th class="p-4 font-medium">Job Title</th>
							<th class="p-4 font-medium">Company</th>
							<th class="p-4 font-medium">Email</th>
							<th class="p-4 font-medium">Phone</th>
							<th class="p-4 font-medium text-right">Actions</th>
						</tr>
					</thead>
					<tbody>
						{#each data.contacts as contact}
							<tr class="border-b last:border-0 hover:bg-muted/50">
								<td class="p-4 font-medium">{contact.firstName} {contact.lastName}</td>
								<td class="p-4 text-sm text-muted-foreground">{contact.jobTitle ?? '-'}</td>
								<td class="p-4 text-sm">{contact.companyName ?? '-'}</td>
								<td class="p-4 text-sm text-muted-foreground">{contact.email ?? '-'}</td>
								<td class="p-4 text-sm text-muted-foreground">{contact.phone ?? '-'}</td>
								<td class="p-4 text-right">
									{#if deletingId === contact.id}
										<form method="POST" action="?/delete" class="inline-flex items-center gap-2">
											<input type="hidden" name="id" value={contact.id} />
											<span class="text-sm text-destructive">Delete?</span>
											<Button type="submit" variant="destructive" size="sm">Yes</Button>
											<Button type="button" variant="ghost" size="sm" onclick={() => (deletingId = null)}>No</Button>
										</form>
									{:else}
										<div class="inline-flex gap-1">
											<Button variant="ghost" size="sm" onclick={() => editContact(contact.id)}>Edit</Button>
											<Button variant="ghost" size="sm" onclick={() => (deletingId = contact.id)}>Delete</Button>
										</div>
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
