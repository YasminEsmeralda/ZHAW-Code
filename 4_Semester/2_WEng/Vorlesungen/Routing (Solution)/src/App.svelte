<script>
	import Router from "svelte-spa-router"
	import routes from "./routes"
</script>



<div id="app">
	<nav>
		<a href="#/">Home</a>

		<!-- TODO: add a link to "#/products" -->
		<a href="#/products">Products</a>
		
		<a href="#/contact">Contact</a>
	</nav>

	<Router {routes}/>
</div>