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

	const segments: Record<string, string> = {
		oil_gas: 'Oil & Gas',
		renewables: 'Renewables',
		utilities: 'Utilities',
		nuclear: 'Nuclear',
		mining: 'Mining',
		government: 'Government',
		other: 'Other'
	};

	function editCompany(id: string) {
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
		<h1 class="text-3xl font-bold">Companies</h1>
		<Button onclick={() => { showForm = !showForm; editingId = null; }}>
			{showForm ? 'Cancel' : '+ New Company'}
		</Button>
	</div>

	{#if showForm}
		<Card.Root>
			<Card.Header>
				<Card.Title class="text-xl">New Company</Card.Title>
			</Card.Header>
			<Card.Content>
				{#if form?.error && !editingId}
					<p class="mb-4 text-sm text-destructive">{form.error}</p>
				{/if}
				<form method="POST" action="?/create" class="grid gap-4 sm:grid-cols-2">
					<div class="space-y-2">
						<Label for="name">Company Name *</Label>
						<Input id="name" name="name" required />
					</div>
					<div class="space-y-2">
						<Label for="industrySegment">Industry Segment</Label>
						<select
							id="industrySegment"
							name="industrySegment"
							class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
						>
							<option value="">Select...</option>
							{#each Object.entries(segments) as [value, label]}
								<option {value}>{label}</option>
							{/each}
						</select>
					</div>
					<div class="space-y-2">
						<Label for="website">Website</Label>
						<Input id="website" name="website" type="url" />
					</div>
					<div class="space-y-2">
						<Label for="phone">Phone</Label>
						<Input id="phone" name="phone" type="tel" />
					</div>
					<div class="space-y-2 sm:col-span-2">
						<Label for="address">Address</Label>
						<Input id="address" name="address" />
					</div>
					<div class="space-y-2 sm:col-span-2">
						<Label for="notes">Notes</Label>
						<Textarea id="notes" name="notes" />
					</div>
					<div class="sm:col-span-2">
						<Button type="submit">Create Company</Button>
					</div>
				</form>
			</Card.Content>
		</Card.Root>
	{/if}

	{#if editingId}
		{@const company = data.companies.find((c) => c.id === editingId)}
		{#if company}
			<Card.Root>
				<Card.Header>
					<div class="flex items-center justify-between">
						<Card.Title class="text-xl">Edit Company</Card.Title>
						<Button variant="ghost" size="sm" onclick={() => (editingId = null)}>Cancel</Button>
					</div>
				</Card.Header>
				<Card.Content>
					{#if form?.error && editingId}
						<p class="mb-4 text-sm text-destructive">{form.error}</p>
					{/if}
					<form method="POST" action="?/update" class="grid gap-4 sm:grid-cols-2">
						<input type="hidden" name="id" value={company.id} />
						<div class="space-y-2">
							<Label for="edit-name">Company Name *</Label>
							<Input id="edit-name" name="name" value={company.name} required />
						</div>
						<div class="space-y-2">
							<Label for="edit-industrySegment">Industry Segment</Label>
							<select
								id="edit-industrySegment"
								name="industrySegment"
								class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
							>
								<option value="">Select...</option>
								{#each Object.entries(segments) as [value, label]}
									<option {value} selected={company.industrySegment === value}>{label}</option>
								{/each}
							</select>
						</div>
						<div class="space-y-2">
							<Label for="edit-website">Website</Label>
							<Input id="edit-website" name="website" type="url" value={company.website ?? ''} />
						</div>
						<div class="space-y-2">
							<Label for="edit-phone">Phone</Label>
							<Input id="edit-phone" name="phone" type="tel" value={company.phone ?? ''} />
						</div>
						<div class="space-y-2 sm:col-span-2">
							<Label for="edit-address">Address</Label>
							<Input id="edit-address" name="address" value={company.address ?? ''} />
						</div>
						<div class="space-y-2 sm:col-span-2">
							<Label for="edit-notes">Notes</Label>
							<Textarea id="edit-notes" name="notes" value={company.notes ?? ''} />
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
			{#if data.companies.length === 0}
				<p class="p-6 text-sm text-muted-foreground">No companies yet. Add your first company to get started.</p>
			{:else}
				<table class="w-full">
					<thead>
						<tr class="border-b text-left text-sm text-muted-foreground">
							<th class="p-4 font-medium">Name</th>
							<th class="p-4 font-medium">Segment</th>
							<th class="p-4 font-medium">Phone</th>
							<th class="p-4 font-medium">Website</th>
							<th class="p-4 font-medium text-right">Actions</th>
						</tr>
					</thead>
					<tbody>
						{#each data.companies as company}
							<tr class="border-b last:border-0 hover:bg-muted/50">
								<td class="p-4 font-medium"><a href="/companies/{company.id}" class="hover:underline">{company.name}</a></td>
								<td class="p-4">
									{#if company.industrySegment}
										<Badge variant="outline">{segments[company.industrySegment] ?? company.industrySegment}</Badge>
									{/if}
								</td>
								<td class="p-4 text-sm text-muted-foreground">{company.phone ?? '-'}</td>
								<td class="p-4 text-sm text-muted-foreground">{company.website ?? '-'}</td>
								<td class="p-4 text-right">
									{#if deletingId === company.id}
										<form method="POST" action="?/delete" class="inline-flex items-center gap-2">
											<input type="hidden" name="id" value={company.id} />
											<span class="text-sm text-destructive">Delete?</span>
											<Button type="submit" variant="destructive" size="sm">Yes</Button>
											<Button type="button" variant="ghost" size="sm" onclick={() => (deletingId = null)}>No</Button>
										</form>
									{:else}
										<div class="inline-flex gap-1">
											<Button variant="ghost" size="sm" onclick={() => editCompany(company.id)}>Edit</Button>
											<Button variant="ghost" size="sm" onclick={() => (deletingId = company.id)}>Delete</Button>
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
