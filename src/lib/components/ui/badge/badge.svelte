<script lang="ts">
	import { cn } from '$lib/utils';
	import { badgeVariants, type Variant } from './index';
	import type { Snippet } from 'svelte';

	let { class: className, variant, children, ...restProps }: { class?: string; variant?: Variant; children?: Snippet } = $props();
</script>

<div class={cn(badgeVariants({ variant, className }))} {...restProps}>
	{@render children?.()}
</div>
