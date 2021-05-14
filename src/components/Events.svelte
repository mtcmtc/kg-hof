<script>
	import { onMount } from 'svelte';

	import Event from './Event.svelte';
	
	export let events = {};
</script>
<div class="events flex flex-col">
	{#each events as event, i}
		<Event data={event} index={i}/>
	{/each}
</div>