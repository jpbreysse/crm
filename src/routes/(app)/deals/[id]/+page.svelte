<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import ActivityTimeline from '$lib/components/activity-timeline.svelte';

	let { data, form } = $props();
	let showTaskForm = $state(false);
	let newTaskTitle = $state('');
	let newTaskDueDate = $state('');

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

	function isOverdue(dueDate: string | null) {
		if (!dueDate) return false;
		return new Date(dueDate) < new Date(new Date().toDateString());
	}

	let todoTasks = $derived(data.tasks.filter((t) => t.status === 'todo'));
	let doneTasks = $derived(data.tasks.filter((t) => t.status === 'done'));

	$effect(() => {
		if (form?.success) {
			showTaskForm = false;
			newTaskTitle = '';
			newTaskDueDate = '';
		}
	});
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
				<Card.Title class="text-2xl">
					{#if data.deal.companyName}
						<a href="/companies/{data.deal.companyId}" class="hover:underline">{data.deal.companyName}</a>
					{:else}
						-
					{/if}
				</Card.Title>
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

	<!-- Tasks Section -->
	<div class="space-y-4">
		<div class="flex items-center justify-between">
			<h2 class="text-lg font-semibold">Tasks</h2>
			<Button size="sm" onclick={() => (showTaskForm = !showTaskForm)}>
				{showTaskForm ? 'Cancel' : '+ Add Task'}
			</Button>
		</div>

		{#if showTaskForm}
			<Card.Root>
				<Card.Content class="pt-6">
					<form method="POST" action="?/createTask" class="flex items-end gap-3">
						<div class="flex-1 space-y-1">
							<label for="taskTitle" class="text-sm font-medium">Task</label>
							<Input id="taskTitle" name="title" placeholder="e.g. Call back John about proposal" bind:value={newTaskTitle} required />
						</div>
						<div class="w-40 space-y-1">
							<label for="taskDueDate" class="text-sm font-medium">Due date</label>
							<Input id="taskDueDate" name="dueDate" type="date" bind:value={newTaskDueDate} />
						</div>
						<Button type="submit" size="sm">Add</Button>
					</form>
				</Card.Content>
			</Card.Root>
		{/if}

		{#if todoTasks.length === 0 && doneTasks.length === 0}
			<p class="py-4 text-center text-sm text-muted-foreground">No tasks yet. Add your first task to track next steps.</p>
		{:else}
			<div class="space-y-2">
				{#each todoTasks as task}
					<div class="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50">
						<form method="POST" action="?/toggleTask" class="flex items-center">
							<input type="hidden" name="id" value={task.id} />
							<input type="hidden" name="currentStatus" value={task.status} />
							<button type="submit" class="flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 border-input hover:border-primary" aria-label="Mark as done">
							</button>
						</form>
						<span class="flex-1 text-sm">{task.title}</span>
						{#if task.dueDate}
							<span class="text-xs {isOverdue(task.dueDate) ? 'font-semibold text-destructive' : 'text-muted-foreground'}">
								{isOverdue(task.dueDate) ? '⚠ ' : ''}{task.dueDate}
							</span>
						{/if}
						<form method="POST" action="?/deleteTask">
							<input type="hidden" name="id" value={task.id} />
							<button type="submit" class="text-xs text-muted-foreground hover:text-destructive" aria-label="Delete task">
								<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
									<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</form>
					</div>
				{/each}
				{#each doneTasks as task}
					<div class="flex items-center gap-3 rounded-lg border p-3 opacity-50">
						<form method="POST" action="?/toggleTask" class="flex items-center">
							<input type="hidden" name="id" value={task.id} />
							<input type="hidden" name="currentStatus" value={task.status} />
							<button type="submit" class="flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 border-primary bg-primary text-primary-foreground" aria-label="Mark as todo">
								<svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
									<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
								</svg>
							</button>
						</form>
						<span class="flex-1 text-sm line-through">{task.title}</span>
						{#if task.dueDate}
							<span class="text-xs text-muted-foreground">{task.dueDate}</span>
						{/if}
						<form method="POST" action="?/deleteTask">
							<input type="hidden" name="id" value={task.id} />
							<button type="submit" class="text-xs text-muted-foreground hover:text-destructive" aria-label="Delete task">
								<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
									<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</form>
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<ActivityTimeline
		activities={data.activities}
		contacts={data.contacts}
		prefillDealId={data.deal.id}
		prefillContactId={data.deal.contactId ?? ''}
		showDealColumn={false}
		{form}
	/>
</div>
