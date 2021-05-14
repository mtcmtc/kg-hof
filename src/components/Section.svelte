<script>
	let classList = ''
	let sectionId = ''
	export { sectionId as id }
	export { classList as class }
</script>

<section id={sectionId} class={`relative mx-auto ${classList || ''}`}>
	<div class="container mx-auto relative">
		<slot></slot>
	</div>
</section>