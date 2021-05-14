<script>
	import { onDestroy } from 'svelte';
	import { fade } from 'svelte/transition';
	let ellipses = '.'

	const loader = setInterval(()=>{
		if(ellipses.length < 3){
			ellipses += '.';
		}else{
			ellipses = '.';
		}
	},500)

	onDestroy(() => clearInterval(loader));
</script>
<div transition:fade class="flex justify-center items-center fixed h-full w-full top-0 left-0 bg-black text-white uppercase z-20 uppercase text-2xl font-black">
	Loading{ellipses}
</div>