<script>
	import { onMount, onDestroy } from 'svelte';
	import { lightboxContent } from '../stores.js';
	import { fade } from 'svelte/transition';

	function handleClose(event){
		event.target.tagName !== 'IMG' && lightboxContent.set(null);
	}

	function handleKeydown(event){
		if(event.keyCode === 27){
			handleClose(event);
		}
	}

	let lightboxImage = document.createElement('img');
		lightboxImage.src = $lightboxContent.content.image;
		lightboxImage.alt = $lightboxContent.name;

	let portrait = false;

	onMount(()=>{
		if(lightboxImage){
			portrait = lightboxImage.width < lightboxImage.height ? true : false;
		}
	})

	onDestroy(()=>{
		lightboxImage.remove();
	})

</script>

<svelte:window on:keydown={handleKeydown}/>

<div transition:fade on:click={handleClose} class="flex flex-col justify-center items-center bg-black bg-opacity-50 fixed top-0 left-0 h-full w-full">
	<div class={`p-5 ${portrait ? 'md:max-w-500px' : 'md:max-w-2/3'}`}>
		<div class="ml-auto text-black bg-white h-5 w-5 mb-2 flex justify-center items-center cursor-pointer rounded-full transform rotate-45">
			<span class="close-button leading-normal">+</span>
		</div>
		<img id="lightboxImage" src={lightboxImage.src} alt={lightboxImage.alt}/>
	</div>
</div>