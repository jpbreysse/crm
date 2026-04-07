<script lang="ts">
	import { goto } from '$app/navigation';

	type SearchResults = {
		companies: { id: string; name: string; industrySegment: string | null }[];
		contacts: { id: string; firstName: string; lastName: string; email: string | null; jobTitle: string | null }[];
		deals: { id: string; title: string; stage: string; companyName: string | null }[];
	};

	let query = $state('');
	let results = $state<SearchResults | null>(null);
	let isOpen = $state(false);
	let selectedIndex = $state(-1);
	let debounceTimer: ReturnType<typeof setTimeout>;
	let inputEl: HTMLInputElement;

	function allResults() {
		if (!results) return [];
		const items: { type: string; label: string; sub: string; href: string }[] = [];
		for (const c of results.companies) {
			items.push({ type: 'Company', label: c.name, sub: c.industrySegment ?? '', href: `/companies` });
		}
		for (const c of results.contacts) {
			items.push({ type: 'Contact', label: `${c.firstName} ${c.lastName}`, sub: c.jobTitle ?? c.email ?? '', href: `/contacts/${c.id}` });
		}
		for (const d of results.deals) {
			items.push({ type: 'Deal', label: d.title, sub: d.companyName ?? d.stage, href: `/deals/${d.id}` });
		}
		return items;
	}

	async function search() {
		if (query.trim().length < 2) {
			results = null;
			isOpen = false;
			return;
		}

		const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
		if (res.ok) {
			results = await res.json();
			isOpen = true;
			selectedIndex = -1;
		}
	}

	function onInput() {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(search, 300);
	}

	function onKeydown(e: KeyboardEvent) {
		const items = allResults();
		if (!isOpen || items.length === 0) return;

		if (e.key === 'ArrowDown') {
			e.preventDefault();
			selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			selectedIndex = Math.max(selectedIndex - 1, 0);
		} else if (e.key === 'Enter' && selectedIndex >= 0) {
			e.preventDefault();
			navigate(items[selectedIndex].href);
		} else if (e.key === 'Escape') {
			isOpen = false;
		}
	}

	function navigate(href: string) {
		isOpen = false;
		query = '';
		results = null;
		goto(href);
	}

	function onBlur() {
		// Delay to allow click events on results
		setTimeout(() => { isOpen = false; }, 200);
	}
</script>

<div class="relative px-3 py-2">
	<div class="relative">
		<svg class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
			<path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
		</svg>
		<input
			bind:this={inputEl}
			bind:value={query}
			oninput={onInput}
			onkeydown={onKeydown}
			onfocus={() => { if (results && allResults().length > 0) isOpen = true; }}
			onblur={onBlur}
			type="text"
			placeholder="Search..."
			class="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
		/>
	</div>

	{#if isOpen && results}
		{@const items = allResults()}
		{#if items.length > 0}
			<div class="absolute left-3 right-3 z-50 mt-1 max-h-80 overflow-y-auto rounded-md border bg-popover shadow-lg">
				{#if results.companies.length > 0}
					<div class="px-3 py-1.5 text-xs font-semibold text-muted-foreground">Companies</div>
					{#each results.companies as company, i}
						{@const idx = i}
						<button
							class="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-accent {selectedIndex === idx ? 'bg-accent' : ''}"
							onmousedown={() => navigate('/companies')}
						>
							<svg class="h-4 w-4 shrink-0 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
								<path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
							</svg>
							<div class="min-w-0 flex-1">
								<p class="truncate font-medium">{company.name}</p>
							</div>
						</button>
					{/each}
				{/if}
				{#if results.contacts.length > 0}
					<div class="px-3 py-1.5 text-xs font-semibold text-muted-foreground {results.companies.length > 0 ? 'border-t' : ''}">Contacts</div>
					{#each results.contacts as contact}
						{@const idx = results.companies.length + results.contacts.indexOf(contact)}
						<button
							class="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-accent {selectedIndex === idx ? 'bg-accent' : ''}"
							onmousedown={() => navigate(`/contacts/${contact.id}`)}
						>
							<svg class="h-4 w-4 shrink-0 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
								<path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
							</svg>
							<div class="min-w-0 flex-1">
								<p class="truncate font-medium">{contact.firstName} {contact.lastName}</p>
								<p class="truncate text-xs text-muted-foreground">{contact.jobTitle ?? contact.email ?? ''}</p>
							</div>
						</button>
					{/each}
				{/if}
				{#if results.deals.length > 0}
					<div class="px-3 py-1.5 text-xs font-semibold text-muted-foreground {results.companies.length > 0 || results.contacts.length > 0 ? 'border-t' : ''}">Deals</div>
					{#each results.deals as deal}
						{@const idx = results.companies.length + results.contacts.length + results.deals.indexOf(deal)}
						<button
							class="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-accent {selectedIndex === idx ? 'bg-accent' : ''}"
							onmousedown={() => navigate(`/deals/${deal.id}`)}
						>
							<svg class="h-4 w-4 shrink-0 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
								<path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							<div class="min-w-0 flex-1">
								<p class="truncate font-medium">{deal.title}</p>
								<p class="truncate text-xs text-muted-foreground">{deal.companyName ?? deal.stage}</p>
							</div>
						</button>
					{/each}
				{/if}
			</div>
		{:else if query.length >= 2}
			<div class="absolute left-3 right-3 z-50 mt-1 rounded-md border bg-popover p-4 text-center text-sm text-muted-foreground shadow-lg">
				No results found
			</div>
		{/if}
	{/if}
</div>
