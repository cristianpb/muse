<script>
	import Nav from '../components/Nav.svelte';
  import NavBottom from '../components/NavBottom.svelte';
  import SnapClients from '../components/SnapClients.svelte';

	export let segment;
</script>

<style>
	main {
		position: relative;
		max-width: 56em;
		background-color: white;
		padding: 2em;
		margin: 0 auto;
		box-sizing: border-box;
	}
</style>

<Nav {segment}/>

<main>
	<slot></slot>
  <SnapClients/>
</main>

<NavBottom/>
