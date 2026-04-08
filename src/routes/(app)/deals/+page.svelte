<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Badge } from '$lib/components/ui/badge';

	let { data, form } = $props();
	let showForm = $state(false);
	let viewMode = $state<'table' | 'kanban'>('kanban');
	let editingId = $state<string | null>(null);
	let deletingId = $state<string | null>(null);

	const stages = ['lead', 'qualified', 'proposal', 'negotiation', 'won', 'lost'] as const;
	const stageLabels: Record<string, string> = {
		lead: 'Lead',
		qualified: 'Qualified',
		proposal: 'Proposal',
		negotiation: 'Negotiation',
		won: 'Won',
		lost: 'Lost'
	};
	const stageColors: Record<string, string> = {
		lead: 'bg-slate-100',
		qualified: 'bg-blue-50',
		proposal: 'bg-indigo-50',
		negotiation: 'bg-amber-50',
		won: 'bg-green-50',
		lost: 'bg-red-50'
	};

	function formatCurrency(value: string | null) {
		if (!value) return '-';
		return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(value));
	}

	function dealsByStage(stage: string) {
		return data.deals.filter((d) => d.stage === stage);
	}

	function editDeal(id: string) {
		editingId = id;
		showForm = false;
	}

	function prevStage(stage: string): string | null {
		const idx = stages.indexOf(stage as any);
		return idx > 0 ? stages[idx - 1] : null;
	}

	function nextStage(stage: string): string | null {
		const idx = stages.indexOf(stage as any);
		return idx < stages.length - 1 ? stages[idx + 1] : null;
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
		<h1 class="text-3xl font-bold">Deals</h1>
		<div class="flex gap-2">
			<Button variant={viewMode === 'kanban' ? 'default' : 'outline'} size="sm" onclick={() => (viewMode = 'kanban')}>
				Board
			</Button>
			<Button variant={viewMode === 'table' ? 'default' : 'outline'} size="sm" onclick={() => (viewMode = 'table')}>
				Table
			</Button>
			<Button onclick={() => { showForm = !showForm; editingId = null; }}>
				{showForm ? 'Cancel' : '+ New Deal'}
			</Button>
		</div>
	</div>

	{#if showForm}
		<Card.Root>
			<Card.Header>
				<Card.Title class="text-xl">New Deal</Card.Title>
			</Card.Header>
			<Card.Content>
				{#if form?.error && !editingId}
					<p class="mb-4 text-sm text-destructive">{form.error}</p>
				{/if}
				<form method="POST" action="?/create" class="grid gap-4 sm:grid-cols-2">
					<div class="space-y-2">
						<Label for="title">Deal Title *</Label>
						<Input id="title" name="title" required />
					</div>
					<div class="space-y-2">
						<Label for="value">Value ($)</Label>
						<Input id="value" name="value" type="number" step="0.01" />
					</div>
					<div class="space-y-2">
						<Label for="stage">Stage</Label>
						<select id="stage" name="stage" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
							{#each stages as stage}
								<option value={stage}>{stageLabels[stage]}</option>
							{/each}
						</select>
					</div>
					<div class="space-y-2">
						<Label for="expectedCloseDate">Expected Close Date</Label>
						<Input id="expectedCloseDate" name="expectedCloseDate" type="date" />
					</div>
					<div class="space-y-2">
						<Label for="companyId">Company</Label>
						<select id="companyId" name="companyId" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
							<option value="">Select...</option>
							{#each data.companies as company}
								<option value={company.id}>{company.name}</option>
							{/each}
						</select>
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
					<div class="space-y-2 sm:col-span-2">
						<Label for="description">Description</Label>
						<Textarea id="description" name="description" />
					</div>
					<div class="sm:col-span-2">
						<Button type="submit">Create Deal</Button>
					</div>
				</form>
			</Card.Content>
		</Card.Root>
	{/if}

	{#if editingId}
		{@const deal = data.deals.find((d) => d.id === editingId)}
		{#if deal}
			<Card.Root>
				<Card.Header>
					<div class="flex items-center justify-between">
						<Card.Title class="text-xl">Edit Deal</Card.Title>
						<Button variant="ghost" size="sm" onclick={() => (editingId = null)}>Cancel</Button>
					</div>
				</Card.Header>
				<Card.Content>
					{#if form?.error && editingId}
						<p class="mb-4 text-sm text-destructive">{form.error}</p>
					{/if}
					<form method="POST" action="?/update" class="grid gap-4 sm:grid-cols-2">
						<input type="hidden" name="id" value={deal.id} />
						<div class="space-y-2">
							<Label for="edit-title">Deal Title *</Label>
							<Input id="edit-title" name="title" value={deal.title} required />
						</div>
						<div class="space-y-2">
							<Label for="edit-value">Value ($)</Label>
							<Input id="edit-value" name="value" type="number" step="0.01" value={deal.value ?? ''} />
						</div>
						<div class="space-y-2">
							<Label for="edit-stage">Stage</Label>
							<select id="edit-stage" name="stage" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
								{#each stages as stage}
									<option value={stage} selected={deal.stage === stage}>{stageLabels[stage]}</option>
								{/each}
							</select>
						</div>
						<div class="space-y-2">
							<Label for="edit-expectedCloseDate">Expected Close Date</Label>
							<Input id="edit-expectedCloseDate" name="expectedCloseDate" type="date" value={deal.expectedCloseDate ?? ''} />
						</div>
						<div class="space-y-2">
							<Label for="edit-companyId">Company</Label>
							<select id="edit-companyId" name="companyId" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
								<option value="">Select...</option>
								{#each data.companies as company}
									<option value={company.id} selected={deal.companyId === company.id}>{company.name}</option>
								{/each}
							</select>
						</div>
						<div class="space-y-2">
							<Label for="edit-contactId">Contact</Label>
							<select id="edit-contactId" name="contactId" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
								<option value="">Select...</option>
								{#each data.contacts as contact}
									<option value={contact.id} selected={deal.contactId === contact.id}>{contact.firstName} {contact.lastName}</option>
								{/each}
							</select>
						</div>
						<div class="space-y-2 sm:col-span-2">
							<Label for="edit-description">Description</Label>
							<Textarea id="edit-description" name="description" value={deal.description ?? ''} />
						</div>
						<div class="sm:col-span-2">
							<Button type="submit">Save Changes</Button>
						</div>
					</form>
				</Card.Content>
			</Card.Root>
		{/if}
	{/if}

	{#if viewMode === 'kanban'}
		<div class="flex gap-4 overflow-x-auto pb-4">
			{#each stages as stage}
				<div class="min-w-[280px] flex-1">
					<div class="mb-3 flex items-center justify-between">
						<h3 class="text-sm font-semibold">{stageLabels[stage]}</h3>
						<span class="text-xs text-muted-foreground">{dealsByStage(stage).length}</span>
					</div>
					<div class="space-y-3">
						{#each dealsByStage(stage) as deal}
							<div class="rounded-lg border {stageColors[stage]} p-4">
								<div class="flex items-start justify-between">
									<div>
										<a href="/deals/{deal.id}" class="font-medium hover:underline">{deal.title}</a>
										<p class="text-sm text-muted-foreground">{deal.companyName ?? 'No company'}</p>
									</div>
									<div class="flex gap-1">
										<button class="text-xs text-muted-foreground hover:text-foreground" onclick={() => editDeal(deal.id)}>Edit</button>
										{#if deletingId === deal.id}
											<form method="POST" action="?/delete" class="inline-flex items-center gap-1">
												<input type="hidden" name="id" value={deal.id} />
												<button type="submit" class="text-xs text-destructive">Yes</button>
												<button type="button" class="text-xs text-muted-foreground" onclick={() => (deletingId = null)}>No</button>
											</form>
										{:else}
											<button class="text-xs text-muted-foreground hover:text-destructive" onclick={() => (deletingId = deal.id)}>Del</button>
										{/if}
									</div>
								</div>
								<p class="mt-2 text-lg font-semibold">{formatCurrency(deal.value)}</p>
								{#if deal.expectedCloseDate}
									<p class="text-xs text-muted-foreground">Close: {deal.expectedCloseDate}</p>
								{/if}
								<div class="mt-3 flex items-center justify-between border-t pt-2">
									{#if prevStage(deal.stage)}
										<form method="POST" action="?/moveStage">
											<input type="hidden" name="id" value={deal.id} />
											<input type="hidden" name="stage" value={prevStage(deal.stage)} />
											<button type="submit" class="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
												<svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg>
												{stageLabels[prevStage(deal.stage) ?? '']}
											</button>
										</form>
									{:else}
										<span></span>
									{/if}
									{#if nextStage(deal.stage)}
										<form method="POST" action="?/moveStage">
											<input type="hidden" name="id" value={deal.id} />
											<input type="hidden" name="stage" value={nextStage(deal.stage)} />
											<button type="submit" class="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
												{stageLabels[nextStage(deal.stage) ?? '']}
												<svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
											</button>
										</form>
									{:else}
										<span></span>
									{/if}
								</div>
							</div>
						{/each}
						{#if dealsByStage(stage).length === 0}
							<div class="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
								No deals
							</div>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<Card.Root>
			<Card.Content class="p-0">
				{#if data.deals.length === 0}
					<p class="p-6 text-sm text-muted-foreground">No deals yet.</p>
				{:else}
					<table class="w-full">
						<thead>
							<tr class="border-b text-left text-sm text-muted-foreground">
								<th class="p-4 font-medium">Title</th>
								<th class="p-4 font-medium">Company</th>
								<th class="p-4 font-medium">Value</th>
								<th class="p-4 font-medium">Stage</th>
								<th class="p-4 font-medium">Close Date</th>
								<th class="p-4 font-medium text-right">Actions</th>
							</tr>
						</thead>
						<tbody>
							{#each data.deals as deal}
								<tr class="border-b last:border-0 hover:bg-muted/50">
									<td class="p-4 font-medium"><a href="/deals/{deal.id}" class="hover:underline">{deal.title}</a></td>
									<td class="p-4 text-sm">{deal.companyName ?? '-'}</td>
									<td class="p-4 text-sm">{formatCurrency(deal.value)}</td>
									<td class="p-4"><Badge variant="outline">{stageLabels[deal.stage]}</Badge></td>
									<td class="p-4 text-sm text-muted-foreground">{deal.expectedCloseDate ?? '-'}</td>
									<td class="p-4 text-right">
										{#if deletingId === deal.id}
											<form method="POST" action="?/delete" class="inline-flex items-center gap-2">
												<input type="hidden" name="id" value={deal.id} />
												<span class="text-sm text-destructive">Delete?</span>
												<Button type="submit" variant="destructive" size="sm">Yes</Button>
												<Button type="button" variant="ghost" size="sm" onclick={() => (deletingId = null)}>No</Button>
											</form>
										{:else}
											<div class="inline-flex gap-1">
												<Button variant="ghost" size="sm" onclick={() => editDeal(deal.id)}>Edit</Button>
												<Button variant="ghost" size="sm" onclick={() => (deletingId = deal.id)}>Delete</Button>
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
	{/if}
</div>
