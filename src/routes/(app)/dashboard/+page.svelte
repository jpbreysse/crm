<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';

	let { data } = $props();

	const stageColors: Record<string, string> = {
		lead: 'secondary',
		qualified: 'outline',
		proposal: 'default',
		negotiation: 'default',
		won: 'default',
		lost: 'destructive'
	};

	function formatCurrency(value: string | null) {
		if (!value) return '$0';
		return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(value));
	}
</script>

<div class="space-y-8">
	<h1 class="text-3xl font-bold">Dashboard</h1>

	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
		<Card.Root>
			<Card.Header class="pb-2">
				<Card.Description>Companies</Card.Description>
				<Card.Title class="text-4xl">{data.stats.companies}</Card.Title>
			</Card.Header>
		</Card.Root>
		<Card.Root>
			<Card.Header class="pb-2">
				<Card.Description>Contacts</Card.Description>
				<Card.Title class="text-4xl">{data.stats.contacts}</Card.Title>
			</Card.Header>
		</Card.Root>
		<Card.Root>
			<Card.Header class="pb-2">
				<Card.Description>Deals</Card.Description>
				<Card.Title class="text-4xl">{data.stats.deals}</Card.Title>
			</Card.Header>
		</Card.Root>
		<Card.Root>
			<Card.Header class="pb-2">
				<Card.Description>Won Revenue</Card.Description>
				<Card.Title class="text-4xl">{formatCurrency(data.stats.wonValue)}</Card.Title>
			</Card.Header>
		</Card.Root>
	</div>

	<div class="grid gap-8 lg:grid-cols-2">
		<Card.Root>
			<Card.Header>
				<Card.Title class="text-xl">Recent Deals</Card.Title>
			</Card.Header>
			<Card.Content>
				{#if data.recentDeals.length === 0}
					<p class="text-sm text-muted-foreground">No deals yet. Create your first deal to get started.</p>
				{:else}
					<div class="space-y-4">
						{#each data.recentDeals as deal}
							<div class="flex items-center justify-between">
								<div>
									<a href="/deals" class="font-medium hover:underline">{deal.title}</a>
									<p class="text-sm text-muted-foreground">{deal.companyName ?? 'No company'}</p>
								</div>
								<div class="flex items-center gap-2">
									<span class="text-sm font-medium">{formatCurrency(deal.value)}</span>
									<Badge variant={stageColors[deal.stage] as any}>{deal.stage}</Badge>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title class="text-xl">Recent Activity</Card.Title>
			</Card.Header>
			<Card.Content>
				{#if data.recentActivities.length === 0}
					<p class="text-sm text-muted-foreground">No activity yet. Log your first interaction.</p>
				{:else}
					<div class="space-y-4">
						{#each data.recentActivities as activity}
							<div class="flex items-center justify-between">
								<div>
									<p class="font-medium">{activity.subject}</p>
									<p class="text-sm text-muted-foreground">
										{activity.contactFirstName} {activity.contactLastName}
									</p>
								</div>
								<Badge variant="outline">{activity.type}</Badge>
							</div>
						{/each}
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>
</div>
