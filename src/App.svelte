<script>
	import { onMount } from 'svelte';
	import { lightboxContent } from './stores.js'

	import loadImage from 'image-promise'
	import ScrollReveal from 'scrollreveal';

	import Tailwind from "./Tailwind.svelte";
	import data from "./data/data.js";

	import Section from "./components/Section.svelte";
	import Loading from "./components/Loading.svelte";
	import Spotlight from "./components/Spotlight.svelte";
	import Footer from "./components/Footer.svelte";
	import TimelineBar from "./components/TimelineBar.svelte";
	import Events from "./components/Events.svelte";
	import YTEmbed from './components/YTEmbed.svelte';
	import Lightbox from "./components/Lightbox.svelte";

	import Marketo from "./components/Marketo.svelte"

	let { hero, timeline, ugc } = data;

	let loading = true;

    function handleRender(){
		if(document.getElementsByClassName("twitter-tweet")){
	    	const script = document.createElement("script");
			script.setAttribute("src", "https://platform.twitter.com/widgets.js");
			script.setAttribute('onload', "twttr.events.bind('rendered',function(e) {window.dispatchEvent(new Event('resize'))});");
			document.getElementsByClassName("twitter-tweet")[0].appendChild(script);
		}else window.dispatchEvent(new Event('resize'))
		loading = false;
	}

	onMount(()=>{
		const images = document.querySelectorAll('img'); // or a NodeList
		ScrollReveal({
		    scale: 0.9,
		    duration: 1000,
		}).reveal('.scroll-reveal', {
			reset:true,
		});

		loadImage(images)
		.then(function (allImgs) {
		    console.log(allImgs.length, 'images loaded!', allImgs);
		})
		.catch(function (err) {
		    console.error('One or more images have failed to load.');
		    console.error(err.errored);
		    console.info('But these loaded fine:');
		    console.info(err.loaded);
		});

		handleRender();
	})
</script>

<Tailwind />

<nav>
	<a href="https://www.nba.com/timberwolves" class="block bg-black text-center uppercase text-white py-2 hover:text-gray-300 font-bold transition-colors duration-200">Enter Timberwolves.com</a>
</nav>
<Spotlight/>
<main class="relative font-body">
	<Section>
		<div class="border-8 border-green-800 border-t-0 lg:max-w-2/3 md:mx-auto lg:rounded-b-xl">
			<YTEmbed vid={hero.video}/>
		</div>
	</Section>
	<Section id={timeline.id}>
		<TimelineBar />
		<Events events={timeline.events}/>
	</Section>
	<Section id={ugc.id} class="text-black pb-10 border-b-8 border-green-800">
		<div class="bg-white border-b-4 border-green-800 border-r-4 max-w-600px mx-2 md:mx-auto p-5 rounded-lg">
			<YTEmbed vid={ugc.video}/>
			<div class="text-center mt-5">
				<h2 class="text-4xl font-bold uppercase mb-2">{ugc.title}</h2>
				<p class="text-xl tracking-wide mb-4">{ugc.desc}</p>
				<a class="inline-block font-bold text-white p-5 bg-green-800 rounded-md uppercase hover:bg-green-700 transition-colors duration-300" href={ugc.cta.link} rel="noreferrer noopener">{ugc.cta.title}</a>
			</div>
		</div>
	</Section>

	{#if loading}
		<Loading />
	{/if}
	{#if $lightboxContent}
		<Lightbox />
	{/if}
</main>
<Footer />

<style global>
	.spotlight, main {
		margin: 0;
		padding: 0;
		background-color: #000;
		background-image: url(../assets/tw21-kg_header_plx_bg.png);
		background-size: 100% auto;
		-webkit-background-size: 100% auto;
		-moz-background-size: 100% auto;
		-o-background-size: 100% auto;
		background-repeat: no-repeat;
		background-position: center 0;
		background-attachment: fixed;
	}
</style>