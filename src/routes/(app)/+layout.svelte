<script lang="ts">
	import AppSidebar from '$lib/components/app-sidebar.svelte';
	import type { Snippet } from 'svelte';

	let { children, data }: { children: Snippet; data: { user: { id: string; name: string; email: string; role: string | null } } } = $props();
</script>

<div class="flex h-screen">
	<AppSidebar user={data.user} />
	<main class="flex-1 overflow-y-auto p-8">
		{@render children()}
	</main>
</div>
