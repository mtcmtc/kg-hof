<script>
	import Section from './Section.svelte'

	export let etw = {};
</script>

<Section id={etw.id} class="bg-black py-10 text-white">
	<div class="md:max-w-600px mx-auto text-center">
		<h2 class="text-4xl font-bold uppercase mb-2">{etw.title}</h2>
		<p class="text-xl tracking-wide mb-4">{etw.desc}</p>
		<div class="flex flex-wrap">
			<div class="order-2 md:w-1/2"><Marketo data={etw.marketo}/></div>
			<div class="order-1 md:order-2 md:w-1/2"><img src={etw.image} alt={etw.desc}/></div>
		</div>
	</div>
</Section>