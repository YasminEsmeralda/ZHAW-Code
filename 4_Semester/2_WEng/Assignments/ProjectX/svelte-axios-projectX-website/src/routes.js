// Project X: Website
import Home from "./pages/Home.svelte";

//Page
import Page from "./pages/pages/page.svelte"
import CreatePage from "./pages/pages/CreatePage.svelte"

//Provision
import Provision from "./pages/provisions/provision.svelte"
import CreateProvision from "./pages/provisions/createProvision.svelte"

//Navigation
import Navigation from "./pages/navigations/navigation.svelte"
import Menu from "./pages/navigations/menus/menu.svelte"
import CreateMenu from "./pages/navigations/menus/createMenu.svelte"
import Item from "./pages/navigations/items/item.svelte"
import CreateItem from "./pages/navigations/items/createItem.svelte"

// Export the route definition object
export default {
    // Exact path
    '/': Home,
    '/home': Home,

    // Page
    '/page': Page,
    '/create-page': CreatePage,

    // Provision
    '/provision': Provision,
    '/create-provision': CreateProvision,

    //Navigation
    '/navigation': Navigation,
    '/navigation/menu': Menu,
    '/create-menu': CreateMenu,
    '/navigation/item': Item,
    '/create-item': CreateItem,
}