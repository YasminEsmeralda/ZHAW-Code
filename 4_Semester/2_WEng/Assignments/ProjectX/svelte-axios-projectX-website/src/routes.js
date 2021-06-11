// Project X: Website
import Home from "./pages/Home.svelte";
import DemoPage from "./pages/DemoPage.svelte"

//Page
import Page from "./pages/pages/page.svelte"
import CreatePage from "./pages/pages/CreatePage.svelte"

//Provision
import Provision from "./pages/provisions/provision.svelte"
import CreateProvision from "./pages/provisions/createProvision.svelte"

//Navigation
import Navigation from "./pages/navigations/navigation.svelte"
import NavigationList from "./pages/navigations/navigationList.svelte"
import Menu from "./pages/navigations/menus/menu.svelte"
import CreateMenu from "./pages/navigations/menus/createMenu.svelte"
import Item from "./pages/navigations/items/item.svelte"
import CreateItem from "./pages/navigations/items/createItem.svelte"


import Infections from "./pages/infections/Infections.svelte"
import CreateInfection from "./pages/infections/createInfection.svelte"

import Persons from "./pages/persons/Persons.svelte"
import PersonDetails from "./pages/persons/PersonDetails.svelte"
import CreatePerson from "./pages/persons/CreatePerson.svelte"

import Pathogens from "./pages/pathogens/Pathogens.svelte"
import PathogenDetails from "./pages/pathogens/PathogenDetails.svelte"
import CreatePathogen from "./pages/pathogens/createPathogen.svelte"

// Export the route definition object
export default {
    // Exact path
    '/': Home,
    '/home': Home,
    '/demo': DemoPage,

    // Page
    '/page': Page,
    '/create-page': CreatePage,

    // Provision
    '/provision': Provision,
    '/create-provision': CreateProvision,

    //Navigation
    '/navigation': Navigation,
    '/navigation/navigationList': NavigationList,
    '/navigation/menu': Menu,
    '/create-menu': CreateMenu,
    '/navigation/item': Item,
    '/create-item': CreateItem,

    // infections
    '/infections': Infections,
    '/create-infection': CreateInfection,
    
    // persons
    '/persons': Persons,
    '/persons/:id': PersonDetails,
    '/create-person': CreatePerson,

    // pathogens
    '/pathogens': Pathogens,
    '/pathogens/:id': PathogenDetails,
    '/create-pathogen': CreatePathogen,
}