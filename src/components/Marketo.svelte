<script>
	import { onMount } from 'svelte';
	export let data = {};

	let { id, path, token } = data;

	function handleLoad(){
		MktoForms2.loadForm(path, token, id);
	}
</script>
<svelte:head>
	<script src="{path}/js/forms2/js/forms2.min.js" on:load={handleLoad}></script>
</svelte:head>
<form id="mktoForm_{id}"></form>
<style global lang="scss">
	form.mktoForm{
		font-family: 'futura pt', 'futura', 'helvetica', 'arial', 'Open Sans', 'system-ui', 'ui-sans-serif' !important;
		font-size: 16px !important;
		color: #fff !important;
		width:100% !important;
		.mktoField{
			color: #000 !important;
			height:30px !important;
			border-radius: 5px;
		}
		.mktoButtonRow{
			text-align: center;
			width:100%;
			.mktoButtonWrap.mktoSimple{
				margin-left:0 !important;
				.mktoButton{
					font-weight:700;
					min-width:150px;
				    --tw-bg-opacity: 1;
				    background-image: none !important;
				    background-color: rgba(6, 95, 70, var(--tw-bg-opacity)) !important;
					border-radius: 0.375rem;
					border-width:0 !important;
				    padding: .8rem 1.25rem !important;
				    --tw-text-opacity: 1;
				    color: rgba(255, 255, 255, var(--tw-text-opacity)) !important;
				    text-transform: uppercase;
				    transition-property: background-color, border-color, color, fill, stroke;
				    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
				    transition-duration: 150ms;
				    transition-duration: 300ms;

				    &:hover{
			    	    background-color: rgba(4, 120, 87, var(--tw-bg-opacity)) !important;
				    }
				}
			}
		}

		.mktoHtmlText.mktoHasWidth {
			> div{
				padding:0 !important;
			}
			li {
			    padding: 0;
			    margin: 0 10px;
			}
		}
	}
</style>