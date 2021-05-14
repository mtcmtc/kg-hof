<script>
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

<div class={`first:mt-5 last:mb-5 relative inline-flex items-center w-full md:w-1/2 ${even ? 'md:self-start md:pr-4' : 'md:self-end md:pl-4'}`}>
	<div class={`bg-white border-4 border-green-800 h-6 md:absolute md:w-6 ml-2 md:ml-0 rounded-full w-7 ${even ? 'md:-right-3' : 'md:-left-3'}`}></div>
	<div class={`relative text-center arrow left ${even ? 'md:right' : 'md:left'} scroll-reveal invisible bg-white rounded-lg p-5 m-5 border-4 border-green-800 border-l-0 border-t-0 w-full event--${index}`}>
		<p class="uppercase font-body tracking-wide mb-2 md:mb-3 md:text-xl">{date}</p>
		<p class="text-xl md:text-3xl font-black tracking-wider uppercase mb-2 md:mb-4 ">{name}</p>
		{#if content.image}
		<div class='first:mt-0 last:mb-0 my-5'>
			<a on:click={e => handleImage(e, data)} href={content.image}><img class="w-full border-4 border-green-800" src={content.image} alt={name} /></a>
		</div>
		{/if}
		{#if content.video}
		<div class='first:mt-0 last:mb-0 my-5'>
			<div class="border-4 border-green-800"><YTEmbed vid={content.video}/></div>
		</div>
		{/if}
		{#if content.tweet}
		<div class='first:mt-0 last:mb-0 my-5'>
			{@html content.tweet}
		</div>
		{/if}
	</div>
</div>