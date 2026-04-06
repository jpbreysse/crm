<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Badge } from '$lib/components/ui/badge';

	let { data, form } = $props();
	let showForm = $state(false);
	let editingId = $state<string | null>(null);
	let deletingId = $state<string | null>(null);
	let filterType = $state<string>('');

	const activityTypes: Record<string, string> = {
		call: 'Call',
		email: 'Email',
		meeting: 'Meeting',
		note: 'Note'
	};

	const typeColors: Record<string, string> = {
		call: 'default',
		email: 'secondary',
		meeting: 'default',
		note: 'outline'
	};

	function formatDate(date: Date | string) {
		return new Date(date).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function toDateTimeLocal(date: Date | string) {
		const d = new Date(date);
		return d.toISOString().slice(0, 16);
	}

	let filteredActivities = $derived(
		filterType
			? data.activities.filter((a) => a.type === filterType)
			: data.activities
	);

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
		<h1 class="text-3xl font-bold">Activities</h1>
		<div class="flex gap-2">
			<select
				class="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
				bind:value={filterType}
			>
				<option value="">All types</option>
				{#each Object.entries(activityTypes) as [value, label]}
					<option {value}>{label}</option>
				{/each}
			</select>
			<Button onclick={() => { showForm = !showForm; editingId = null; }}>
				{showForm ? 'Cancel' : '+ Log Activity'}
			</Button>
		</div>
	</div>

	{#if showForm}
		<Card.Root>
			<Card.Header>
				<Card.Title class="text-xl">Log Activity</Card.Title>
			</Card.Header>
			<Card.Content>
				{#if form?.error && !editingId}
					<p class="mb-4 text-sm text-destructive">{form.error}</p>
				{/if}
				<form method="POST" action="?/create" class="grid gap-4 sm:grid-cols-2">
					<div class="space-y-2">
						<Label for="type">Type</Label>
						<select id="type" name="type" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
							{#each Object.entries(activityTypes) as [value, label]}
								<option {value}>{label}</option>
							{/each}
						</select>
					</div>
					<div class="space-y-2">
						<Label for="date">Date</Label>
						<Input id="date" name="date" type="datetime-local" value={toDateTimeLocal(new Date())} />
					</div>
					<div class="space-y-2 sm:col-span-2">
						<Label for="subject">Subject *</Label>
						<Input id="subject" name="subject" required />
					</div>
					<div class="space-y-2">
						<Label for="contactId">Contact</Label>
						<select id="contactId" name="contactId" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
							<option value="">Select...</option>
							{#each data.contacts as contact}
								<option value={contact.id}>{contact.firstName} {contact.lastName}</option>
							{/each}
						</select>
					</div>
					<div class="space-y-2">
						<Label for="dealId">Deal</Label>
						<select id="dealId" name="dealId" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
							<option value="">Select...</option>
							{#each data.deals as deal}
								<option value={deal.id}>{deal.title}</option>
							{/each}
						</select>
					</div>
					<div class="space-y-2 sm:col-span-2">
						<Label for="notes">Notes</Label>
						<Textarea id="notes" name="notes" />
					</div>
					<div class="sm:col-span-2">
						<Button type="submit">Log Activity</Button>
					</div>
				</form>
			</Card.Content>
		</Card.Root>
	{/if}

	{#if editingId}
		{@const activity = data.activities.find((a) => a.id === editingId)}
		{#if activity}
			<Card.Root>
				<Card.Header>
					<div class="flex items-center justify-between">
						<Card.Title class="text-xl">Edit Activity</Card.Title>
						<Button variant="ghost" size="sm" onclick={() => (editingId = null)}>Cancel</Button>
					</div>
				</Card.Header>
				<Card.Content>
					{#if form?.error && editingId}
						<p class="mb-4 text-sm text-destructive">{form.error}</p>
					{/if}
					<form method="POST" action="?/update" class="grid gap-4 sm:grid-cols-2">
						<input type="hidden" name="id" value={activity.id} />
						<div class="space-y-2">
							<Label for="edit-type">Type</Label>
							<select id="edit-type" name="type" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
								{#each Object.entries(activityTypes) as [value, label]}
									<option {value} selected={activity.type === value}>{label}</option>
								{/each}
							</select>
						</div>
						<div class="space-y-2">
							<Label for="edit-date">Date</Label>
							<Input id="edit-date" name="date" type="datetime-local" value={toDateTimeLocal(activity.date)} />
						</div>
						<div class="space-y-2 sm:col-span-2">
							<Label for="edit-subject">Subject *</Label>
							<Input id="edit-subject" name="subject" value={activity.subject} required />
						</div>
						<div class="space-y-2">
							<Label for="edit-contactId">Contact</Label>
							<select id="edit-contactId" name="contactId" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
								<option value="">Select...</option>
								{#each data.contacts as contact}
									<option value={contact.id} selected={activity.contactId === contact.id}>{contact.firstName} {contact.lastName}</option>
								{/each}
							</select>
						</div>
						<div class="space-y-2">
							<Label for="edit-dealId">Deal</Label>
							<select id="edit-dealId" name="dealId" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
								<option value="">Select...</option>
								{#each data.deals as deal}
									<option value={deal.id} selected={activity.dealId === deal.id}>{deal.title}</option>
								{/each}
							</select>
						</div>
						<div class="space-y-2 sm:col-span-2">
							<Label for="edit-notes">Notes</Label>
							<Textarea id="edit-notes" name="notes" value={activity.notes ?? ''} />
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
			{#if filteredActivities.length === 0}
				<p class="p-6 text-sm text-muted-foreground">No activities yet. Log your first interaction.</p>
			{:else}
				<table class="w-full">
					<thead>
						<tr class="border-b text-left text-sm text-muted-foreground">
							<th class="p-4 font-medium">Date</th>
							<th class="p-4 font-medium">Type</th>
							<th class="p-4 font-medium">Subject</th>
							<th class="p-4 font-medium">Contact</th>
							<th class="p-4 font-medium">Deal</th>
							<th class="p-4 font-medium text-right">Actions</th>
						</tr>
					</thead>
					<tbody>
						{#each filteredActivities as activity}
							<tr class="border-b last:border-0 hover:bg-muted/50">
								<td class="p-4 text-sm text-muted-foreground">{formatDate(activity.date)}</td>
								<td class="p-4"><Badge variant={typeColors[activity.type] as any}>{activityTypes[activity.type]}</Badge></td>
								<td class="p-4 font-medium">{activity.subject}</td>
								<td class="p-4 text-sm">
									{#if activity.contactFirstName}
										<a href="/contacts/{activity.contactId}" class="hover:underline">{activity.contactFirstName} {activity.contactLastName}</a>
									{:else}
										-
									{/if}
								</td>
								<td class="p-4 text-sm">
									{#if activity.dealTitle}
										<a href="/deals/{activity.dealId}" class="hover:underline">{activity.dealTitle}</a>
									{:else}
										-
									{/if}
								</td>
								<td class="p-4 text-right">
									{#if deletingId === activity.id}
										<form method="POST" action="?/delete" class="inline-flex items-center gap-2">
											<input type="hidden" name="id" value={activity.id} />
											<span class="text-sm text-destructive">Delete?</span>
											<Button type="submit" variant="destructive" size="sm">Yes</Button>
											<Button type="button" variant="ghost" size="sm" onclick={() => (deletingId = null)}>No</Button>
										</form>
									{:else}
										<div class="inline-flex gap-1">
											<Button variant="ghost" size="sm" onclick={() => { editingId = activity.id; showForm = false; }}>Edit</Button>
											<Button variant="ghost" size="sm" onclick={() => (deletingId = activity.id)}>Delete</Button>
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
