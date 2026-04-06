<script lang="ts">
	import '../app.css';
	import AppSidebar from '$lib/components/app-sidebar.svelte';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<div class="flex h-screen">
	<AppSidebar />
	<main class="flex-1 overflow-y-auto p-8">
		{@render children()}
	</main>
</div>
