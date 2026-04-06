<script lang="ts">
	import { cn } from '$lib/utils';
	import { buttonVariants, type Props } from './index';

	let { class: className, variant, size, children, ...restProps }: Props = $props();
</script>

<button class={cn(buttonVariants({ variant, size, className }))} {...restProps}>
	{@render children?.()}
</button>
