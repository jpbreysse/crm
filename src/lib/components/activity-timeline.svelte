<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Card from '$lib/components/ui/card';

	type Activity = {
		id: string;
		type: string;
		subject: string;
		notes: string | null;
		date: Date | string;
		contactId: string | null;
		dealId: string | null;
		contactFirstName?: string | null;
		contactLastName?: string | null;
		dealTitle?: string | null;
	};

	type Contact = { id: string; firstName: string; lastName: string };
	type Deal = { id: string; title: string };

	let {
		activities,
		contacts = [],
		deals = [],
		prefillContactId = '',
		prefillDealId = '',
		showContactColumn = true,
		showDealColumn = true,
		form = null
	}: {
		activities: Activity[];
		contacts?: Contact[];
		deals?: Deal[];
		prefillContactId?: string;
		prefillDealId?: string;
		showContactColumn?: boolean;
		showDealColumn?: boolean;
		form?: any;
	} = $props();

	let showForm = $state(false);
	let editingId = $state<string | null>(null);
	let deletingId = $state<string | null>(null);

	const activityTypes: Record<string, string> = {
		call: 'Call',
		email: 'Email',
		meeting: 'Meeting',
		note: 'Note'
	};

	const typeIcons: Record<string, string> = {
		call: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
		email: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
		meeting: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
		note: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
	};

	function formatDate(date: Date | string) {
		return new Date(date).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function toDateTimeLocal(date: Date | string) {
		const d = new Date(date);
		return d.toISOString().slice(0, 16);
	}

	$effect(() => {
		if (form?.success) {
			showForm = false;
			editingId = null;
			deletingId = null;
		}
	});
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<h2 class="text-lg font-semibold">Activity History</h2>
		<Button size="sm" onclick={() => { showForm = !showForm; editingId = null; }}>
			{showForm ? 'Cancel' : '+ Log Activity'}
		</Button>
	</div>

	{#if showForm}
		<Card.Root>
			<Card.Content class="pt-6">
				<form method="POST" action="?/createActivity" class="grid gap-4 sm:grid-cols-2">
					<div class="space-y-2">
						<Label for="act-type">Type</Label>
						<select id="act-type" name="type" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
							{#each Object.entries(activityTypes) as [value, label]}
								<option {value}>{label}</option>
							{/each}
						</select>
					</div>
					<div class="space-y-2">
						<Label for="act-date">Date</Label>
						<Input id="act-date" name="date" type="datetime-local" value={toDateTimeLocal(new Date())} />
					</div>
					<div class="space-y-2 sm:col-span-2">
						<Label for="act-subject">Subject *</Label>
						<Input id="act-subject" name="subject" required />
					</div>
					{#if showContactColumn && contacts.length > 0}
						<div class="space-y-2">
							<Label for="act-contactId">Contact *</Label>
							<select id="act-contactId" name="contactId" required class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
								<option value="">Select...</option>
								{#each contacts as contact}
									<option value={contact.id} selected={prefillContactId === contact.id}>{contact.firstName} {contact.lastName}</option>
								{/each}
							</select>
						</div>
					{:else if prefillContactId}
						<input type="hidden" name="contactId" value={prefillContactId} />
					{/if}
					{#if showDealColumn && deals.length > 0}
						<div class="space-y-2">
							<Label for="act-dealId">Deal</Label>
							<select id="act-dealId" name="dealId" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
								<option value="">Select...</option>
								{#each deals as deal}
									<option value={deal.id} selected={prefillDealId === deal.id}>{deal.title}</option>
								{/each}
							</select>
						</div>
					{:else if prefillDealId}
						<input type="hidden" name="dealId" value={prefillDealId} />
					{/if}
					<div class="space-y-2 sm:col-span-2">
						<Label for="act-notes">Notes</Label>
						<Textarea id="act-notes" name="notes" />
					</div>
					<div class="sm:col-span-2">
						<Button type="submit">Log Activity</Button>
					</div>
				</form>
			</Card.Content>
		</Card.Root>
	{/if}

	{#if editingId}
		{@const activity = activities.find((a) => a.id === editingId)}
		{#if activity}
			<Card.Root>
				<Card.Content class="pt-6">
					<form method="POST" action="?/updateActivity" class="grid gap-4 sm:grid-cols-2">
						<input type="hidden" name="id" value={activity.id} />
						<div class="space-y-2">
							<Label for="edit-act-type">Type</Label>
							<select id="edit-act-type" name="type" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
								{#each Object.entries(activityTypes) as [value, label]}
									<option {value} selected={activity.type === value}>{label}</option>
								{/each}
							</select>
						</div>
						<div class="space-y-2">
							<Label for="edit-act-date">Date</Label>
							<Input id="edit-act-date" name="date" type="datetime-local" value={toDateTimeLocal(activity.date)} />
						</div>
						<div class="space-y-2 sm:col-span-2">
							<Label for="edit-act-subject">Subject *</Label>
							<Input id="edit-act-subject" name="subject" value={activity.subject} required />
						</div>
						<div class="space-y-2 sm:col-span-2">
							<Label for="edit-act-notes">Notes</Label>
							<Textarea id="edit-act-notes" name="notes" value={activity.notes ?? ''} />
						</div>
						<div class="sm:col-span-2 flex gap-2">
							<Button type="submit">Save</Button>
							<Button type="button" variant="ghost" onclick={() => (editingId = null)}>Cancel</Button>
						</div>
					</form>
				</Card.Content>
			</Card.Root>
		{/if}
	{/if}

	{#if activities.length === 0}
		<p class="py-8 text-center text-sm text-muted-foreground">No activities logged yet.</p>
	{:else}
		<div class="space-y-1">
			{#each activities as activity}
				<div class="flex gap-4 rounded-lg border p-4 hover:bg-muted/50">
					<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
						<svg class="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
							<path stroke-linecap="round" stroke-linejoin="round" d={typeIcons[activity.type] ?? typeIcons.note} />
						</svg>
					</div>
					<div class="flex-1 min-w-0">
						<div class="flex items-start justify-between gap-2">
							<div>
								<p class="font-medium">{activity.subject}</p>
								<div class="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
									<Badge variant="outline">{activityTypes[activity.type]}</Badge>
									<span>{formatDate(activity.date)}</span>
									{#if showContactColumn && activity.contactFirstName}
										<span>-</span>
										<a href="/contacts/{activity.contactId}" class="hover:underline">{activity.contactFirstName} {activity.contactLastName}</a>
									{/if}
									{#if showDealColumn && activity.dealTitle}
										<span>-</span>
										<a href="/deals/{activity.dealId}" class="hover:underline">{activity.dealTitle}</a>
									{/if}
								</div>
							</div>
							<div class="flex shrink-0 gap-1">
								{#if deletingId === activity.id}
									<form method="POST" action="?/deleteActivity" class="inline-flex items-center gap-1">
										<input type="hidden" name="id" value={activity.id} />
										<Button type="submit" variant="destructive" size="sm">Yes</Button>
										<Button type="button" variant="ghost" size="sm" onclick={() => (deletingId = null)}>No</Button>
									</form>
								{:else}
									<Button variant="ghost" size="sm" onclick={() => { editingId = activity.id; showForm = false; }}>Edit</Button>
									<Button variant="ghost" size="sm" onclick={() => (deletingId = activity.id)}>Del</Button>
								{/if}
							</div>
						</div>
						{#if activity.notes}
							<p class="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">{activity.notes}</p>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
