<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import ActivityTimeline from '$lib/components/activity-timeline.svelte';

	let { data, form } = $props();

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
</script>

<div class="space-y-8">
	<div class="flex items-center gap-4">
		<a href="/deals" class="text-muted-foreground hover:text-foreground" aria-label="Back to deals">
			<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
				<path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
			</svg>
		</a>
		<h1 class="text-3xl font-bold">{data.deal.title}</h1>
		<Badge variant="outline">{stageLabels[data.deal.stage]}</Badge>
	</div>

	<div class="grid gap-6 lg:grid-cols-3">
		<Card.Root>
			<Card.Header class="pb-2">
				<Card.Description>Value</Card.Description>
				<Card.Title class="text-2xl">{formatCurrency(data.deal.value)}</Card.Title>
			</Card.Header>
		</Card.Root>
		<Card.Root>
			<Card.Header class="pb-2">
				<Card.Description>Company</Card.Description>
				<Card.Title class="text-2xl">{data.deal.companyName ?? '-'}</Card.Title>
			</Card.Header>
		</Card.Root>
		<Card.Root>
			<Card.Header class="pb-2">
				<Card.Description>Contact</Card.Description>
				<Card.Title class="text-2xl">
					{#if data.deal.contactFirstName}
						<a href="/contacts/{data.deal.contactId}" class="hover:underline">{data.deal.contactFirstName} {data.deal.contactLastName}</a>
					{:else}
						-
					{/if}
				</Card.Title>
			</Card.Header>
		</Card.Root>
	</div>

	{#if data.deal.expectedCloseDate || data.deal.description}
		<Card.Root>
			<Card.Content class="pt-6">
				<div class="grid gap-4 sm:grid-cols-2">
					{#if data.deal.expectedCloseDate}
						<div>
							<p class="text-sm text-muted-foreground">Expected Close Date</p>
							<p class="font-medium">{data.deal.expectedCloseDate}</p>
						</div>
					{/if}
					{#if data.deal.description}
						<div class="sm:col-span-2">
							<p class="text-sm text-muted-foreground">Description</p>
							<p class="mt-1 whitespace-pre-wrap">{data.deal.description}</p>
						</div>
					{/if}
				</div>
			</Card.Content>
		</Card.Root>
	{/if}

	<ActivityTimeline
		activities={data.activities}
		contacts={data.contacts}
		prefillDealId={data.deal.id}
		prefillContactId={data.deal.contactId ?? ''}
		showDealColumn={false}
		{form}
	/>
</div>
