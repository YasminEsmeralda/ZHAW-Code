
import Home from "./pages/Home.svelte";
import Contact from "./pages/Contact.svelte";

// TODO: import the component "Products"
import Products from "./pages/Products.svelte";

// TODO: import the component "ProductDetails"
import ProductDetails from "./pages/ProductDetails.svelte";

export default {
    '/': Home,
    '/home': Home,
    '/contact': Contact,

    // TODO: Add a route "/products" to load the component "Products"
    '/products': Products,

    // TODO: Add a route "/products/:id" to load the component "ProductDetails"
    '/products/:id': ProductDetails,
}