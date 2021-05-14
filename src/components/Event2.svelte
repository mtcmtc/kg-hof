<script>
	import TimelineIndicator from './TimelineIndicator.svelte';
	import YTEmbed from './YTEmbed.svelte';
	export let data = {};
	export let index = 0;

	let even = index % 2 === 0;

	import { lightboxContent } from '../stores.js'

	function handleImage(event, data){
		event.preventDefault();
		lightboxContent.update( current => data);
	}

	let {date, name, content} = data;
</script>

<div class={`first:mt-5 last:mb-5 relative flex items-center w-full`}>
	<div class={`relative text-center arrow left ${even ? 'md:right order-1' : 'md:left order-3'} scroll-reveal invisible bg-white rounded-lg p-5 m-5 border-4 border-green-800 border-l-0 border-t-0 w-full md:w-1/2 event--${index}`}>
		<p class="uppercase font-body tracking-wide mb-2 md:mb-3 md:text-xl">{date}</p>
		<p class="text-xl md:text-3xl font-black tracking-wider uppercase mb-2 md:mb-4 ">{name}</p>
		{#if content.image}
		<div class='first:mt-0 last:mb-0 my-5'>
			<a on:click={e => handleImage(e, data)} href={content.image}><img class="w-full" src={content.image} alt={name} /></a>
		</div>
		{:else if content.video}
		<div class='first:mt-0 last:mb-0 my-5'>
			<YTEmbed vid={content.video}/>
		</div>
		{:else if content.tweet}
		<div class='first:mt-0 last:mb-0 my-5'>
			{@html content.tweet}
		</div>
		{/if}
	</div>
	<TimelineIndicator />
	<div class={`relative text-center left ${even ? 'md:left order-3' : 'md:right order-1'} scroll-reveal invisible w-full md:w-1/2 event--${index} ${(content.image && content.video ? 'arrow bg-white rounded-lg p-5 m-5 border-4 border-green-800 border-l-0 border-t-0' : '')}`}>
		{#if content.image && content.video}
		<div>
			<YTEmbed vid={content.video}/>
		</div>
		{/if}
	</div>
</div>