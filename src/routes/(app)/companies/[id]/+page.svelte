<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';

	let { data, form } = $props();
	let showNoteForm = $state(false);
	let editingNoteId = $state<string | null>(null);
	let deletingNoteId = $state<string | null>(null);
	let newNoteContent = $state('');

	const segments: Record<string, string> = {
		oil_gas: 'Oil & Gas',
		renewables: 'Renewables',
		utilities: 'Utilities',
		nuclear: 'Nuclear',
		mining: 'Mining',
		government: 'Government',
		other: 'Other'
	};

	const stageLabels: Record<string, string> = {
		lead: 'Lead',
		qualified: 'Qualified',
		proposal: 'Proposal',
		negotiation: 'Negotiation',
		won: 'Won',
		lost: 'Lost'
	};

	function formatCurrency(value: string | null) {
		if (!value) return '-';
		return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(value));
	}

	function formatDate(date: Date | string) {
		return new Date(date).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	$effect(() => {
		if (form?.success) {
			showNoteForm = false;
			editingNoteId = null;
			deletingNoteId = null;
			newNoteContent = '';
		}
	});
</script>

<div class="space-y-8">
	<div class="flex items-center gap-4">
		<a href="/companies" class="text-muted-foreground hover:text-foreground" aria-label="Back to companies">
			<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
				<path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
			</svg>
		</a>
		<h1 class="text-3xl font-bold">{data.company.name}</h1>
		{#if data.company.industrySegment}
			<Badge variant="outline">{segments[data.company.industrySegment] ?? data.company.industrySegment}</Badge>
		{/if}
	</div>

	<!-- Company Info -->
	<Card.Root>
		<Card.Content class="pt-6">
			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<div>
					<p class="text-sm text-muted-foreground">Phone</p>
					<p class="font-medium">{data.company.phone ?? '-'}</p>
				</div>
				<div>
					<p class="text-sm text-muted-foreground">Website</p>
					{#if data.company.website}
						<a href={data.company.website} target="_blank" rel="noopener" class="font-medium hover:underline">{data.company.website}</a>
					{:else}
						<p class="font-medium">-</p>
					{/if}
				</div>
				<div>
					<p class="text-sm text-muted-foreground">Address</p>
					<p class="font-medium">{data.company.address ?? '-'}</p>
				</div>
				<div>
					<p class="text-sm text-muted-foreground">Contacts</p>
					<p class="font-medium">{data.contacts.length}</p>
				</div>
			</div>
			{#if data.company.notes}
				<div class="mt-4 border-t pt-4">
					<p class="text-sm text-muted-foreground">About</p>
					<p class="mt-1 whitespace-pre-wrap">{data.company.notes}</p>
				</div>
			{/if}
		</Card.Content>
	</Card.Root>

	<!-- Contacts at this company -->
	{#if data.contacts.length > 0}
		<div class="space-y-4">
			<h2 class="text-lg font-semibold">Contacts</h2>
			<Card.Root>
				<Card.Content class="p-0">
					<table class="w-full">
						<thead>
							<tr class="border-b text-left text-sm text-muted-foreground">
								<th class="p-4 font-medium">Name</th>
								<th class="p-4 font-medium">Job Title</th>
								<th class="p-4 font-medium">Email</th>
								<th class="p-4 font-medium">Phone</th>
							</tr>
						</thead>
						<tbody>
							{#each data.contacts as contact}
								<tr class="border-b last:border-0 hover:bg-muted/50">
									<td class="p-4 font-medium"><a href="/contacts/{contact.id}" class="hover:underline">{contact.firstName} {contact.lastName}</a></td>
									<td class="p-4 text-sm text-muted-foreground">{contact.jobTitle ?? '-'}</td>
									<td class="p-4 text-sm text-muted-foreground">{contact.email ?? '-'}</td>
									<td class="p-4 text-sm text-muted-foreground">{contact.phone ?? '-'}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</Card.Content>
			</Card.Root>
		</div>
	{/if}

	<!-- Deals with this company -->
	{#if data.deals.length > 0}
		<div class="space-y-4">
			<h2 class="text-lg font-semibold">Deals</h2>
			<Card.Root>
				<Card.Content class="p-0">
					<table class="w-full">
						<thead>
							<tr class="border-b text-left text-sm text-muted-foreground">
								<th class="p-4 font-medium">Title</th>
								<th class="p-4 font-medium">Value</th>
								<th class="p-4 font-medium">Stage</th>
							</tr>
						</thead>
						<tbody>
							{#each data.deals as deal}
								<tr class="border-b last:border-0 hover:bg-muted/50">
									<td class="p-4 font-medium"><a href="/deals/{deal.id}" class="hover:underline">{deal.title}</a></td>
									<td class="p-4 text-sm">{formatCurrency(deal.value)}</td>
									<td class="p-4"><Badge variant="outline">{stageLabels[deal.stage]}</Badge></td>
								</tr>
							{/each}
						</tbody>
					</table>
				</Card.Content>
			</Card.Root>
		</div>
	{/if}

	<!-- Notes Timeline -->
	<div class="space-y-4">
		<div class="flex items-center justify-between">
			<h2 class="text-lg font-semibold">Notes</h2>
			<Button size="sm" onclick={() => (showNoteForm = !showNoteForm)}>
				{showNoteForm ? 'Cancel' : '+ Add Note'}
			</Button>
		</div>

		{#if showNoteForm}
			<Card.Root>
				<Card.Content class="pt-6">
					<form method="POST" action="?/createNote" class="space-y-3">
						<Textarea name="content" placeholder="Write a note about this company..." bind:value={newNoteContent} required />
						<Button type="submit" size="sm">Save Note</Button>
					</form>
				</Card.Content>
			</Card.Root>
		{/if}

		{#if editingNoteId}
			{@const note = data.notes.find((n) => n.id === editingNoteId)}
			{#if note}
				<Card.Root>
					<Card.Content class="pt-6">
						<form method="POST" action="?/updateNote" class="space-y-3">
							<input type="hidden" name="id" value={note.id} />
							<Textarea name="content" value={note.content} required />
							<div class="flex gap-2">
								<Button type="submit" size="sm">Save</Button>
								<Button type="button" variant="ghost" size="sm" onclick={() => (editingNoteId = null)}>Cancel</Button>
							</div>
						</form>
					</Card.Content>
				</Card.Root>
			{/if}
		{/if}

		{#if data.notes.length === 0}
			<p class="py-4 text-center text-sm text-muted-foreground">No notes yet. Add a note to keep track of important information about this company.</p>
		{:else}
			<div class="space-y-1">
				{#each data.notes as note}
					<div class="flex gap-4 rounded-lg border p-4 hover:bg-muted/50">
						<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
							<svg class="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
								<path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
							</svg>
						</div>
						<div class="flex-1 min-w-0">
							<div class="flex items-start justify-between gap-2">
								<div>
									<p class="whitespace-pre-wrap text-sm">{note.content}</p>
									<p class="mt-2 text-xs text-muted-foreground">
										{note.authorName ?? 'Unknown'} - {formatDate(note.createdAt)}
									</p>
								</div>
								<div class="flex shrink-0 gap-1">
									{#if deletingNoteId === note.id}
										<form method="POST" action="?/deleteNote" class="inline-flex items-center gap-1">
											<input type="hidden" name="id" value={note.id} />
											<Button type="submit" variant="destructive" size="sm">Yes</Button>
											<Button type="button" variant="ghost" size="sm" onclick={() => (deletingNoteId = null)}>No</Button>
										</form>
									{:else}
										<Button variant="ghost" size="sm" onclick={() => { editingNoteId = note.id; showNoteForm = false; }}>Edit</Button>
										<Button variant="ghost" size="sm" onclick={() => (deletingNoteId = note.id)}>Del</Button>
									{/if}
								</div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
