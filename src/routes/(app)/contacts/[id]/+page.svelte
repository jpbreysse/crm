<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import ActivityTimeline from '$lib/components/activity-timeline.svelte';

	let { data, form } = $props();
</script>

<div class="space-y-8">
	<div class="flex items-center gap-4">
		<a href="/contacts" class="text-muted-foreground hover:text-foreground" aria-label="Back to contacts">
			<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
				<path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
			</svg>
		</a>
		<h1 class="text-3xl font-bold">{data.contact.firstName} {data.contact.lastName}</h1>
	</div>

	<div class="grid gap-6 lg:grid-cols-3">
		<Card.Root>
			<Card.Header class="pb-2">
				<Card.Description>Job Title</Card.Description>
				<Card.Title class="text-2xl">{data.contact.jobTitle ?? '-'}</Card.Title>
			</Card.Header>
		</Card.Root>
		<Card.Root>
			<Card.Header class="pb-2">
				<Card.Description>Company</Card.Description>
				<Card.Title class="text-2xl">{data.contact.companyName ?? '-'}</Card.Title>
			</Card.Header>
		</Card.Root>
		<Card.Root>
			<Card.Header class="pb-2">
				<Card.Description>Activities</Card.Description>
				<Card.Title class="text-2xl">{data.activities.length}</Card.Title>
			</Card.Header>
		</Card.Root>
	</div>

	<Card.Root>
		<Card.Content class="pt-6">
			<div class="grid gap-4 sm:grid-cols-2">
				<div>
					<p class="text-sm text-muted-foreground">Email</p>
					<p class="font-medium">{data.contact.email ?? '-'}</p>
				</div>
				<div>
					<p class="text-sm text-muted-foreground">Phone</p>
					<p class="font-medium">{data.contact.phone ?? '-'}</p>
				</div>
				{#if data.contact.notes}
					<div class="sm:col-span-2">
						<p class="text-sm text-muted-foreground">Notes</p>
						<p class="mt-1 whitespace-pre-wrap">{data.contact.notes}</p>
					</div>
				{/if}
			</div>
		</Card.Content>
	</Card.Root>

	<ActivityTimeline
		activities={data.activities}
		deals={data.deals}
		prefillContactId={data.contact.id}
		showContactColumn={false}
		{form}
	/>
</div>
