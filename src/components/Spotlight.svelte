<script>
	import { fade } from 'svelte/transition';
	const path = 'assets/'
	const layers = [1, 2, 3, 4, 5];

	let y;
</script>

<svelte:window bind:scrollY={y}/>

<section transition:fade class="spotlight font-body">
	<div class="parallax-container mx-auto">
		{#each layers as layer, i}
			<div 
				style="transform: translate(0,{-y * layer / (layers.length - 1)}px)"
				class={`mx-auto lg:max-w-600px ${ layer === 4 ? 'bg-gradient-to-t from-black via-black to-transparent' : ''}`}
			>
				<img
					src="{path}tw21-kg_header_layer_opt_{layer}.png"
					alt="parallax layer {layer}"
				>
			</div>
		{/each}
	</div>
	<div class="text-container relative w-full text-center box-border pointer-events-none flex flex-col items-center justify-between border-b-8 border-green-800 bg-gradient-to-t from-black via-transparent to-transparent overflow-hidden">
		<div class="absolute max-w-100px md:max-w-200px right-3 md:top-4 md:right-5 text-right text-white top-0">
			<span class="text-xs uppercase top-1 relative font-bold">Presented By</span>
			<img class="w-full" alt="star tribune" src="assets/strib-logo.svg">
		</div>
		<span class="absolute font-bold animate-pulse mt-5 text-white block uppercase font-medium text-center text-sm" style="opacity: {1 - Math.max(0, y / 40)}">
			scroll down
			<svg class="w-6 h-6 text-white mx-auto" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor">
	      <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
	    </svg>
		</span>
		<div class="mx-auto lg:max-w-600px">
			<img class="invisible" src="assets/header-placeholder.jpg" alt>
		</div>
		<div class="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black to-transparent">
			<img class="mx-auto lg:h-auto lg:w-1/2" src="assets/tw21-kg_header_layer_copy.png" alt="parallax layer copy">
		</div>
		<div class="absolute mix-blend-screen w-full top-0 left-0">
			<img class="w-full" src="assets/tw21-kg_header_layer_lighting.png" alt="parallax layer lighting">
		</div>
	</div>
</section>



<style lang="scss">
	.parallax-container {
		position: fixed;
		width: 100%;
		left: 50%;
		transform: translate(-50%,0);

		img {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			will-change: transform;

			&:last-child::after {
				content: '';
				position: absolute;
				width: 100%;
				height: 100%;
				background: rgb(45,10,13);
			}
		}
	}

	span { will-change: transform, opacity; }
</style>