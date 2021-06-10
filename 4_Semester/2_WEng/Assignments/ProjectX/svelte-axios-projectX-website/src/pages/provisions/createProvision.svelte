<script>
    import axios from "axios";
import { push } from "svelte-spa-router";
    import { onMount } from "svelte";

    let provision = {
        dateFrom: null,
        dateTo: null,
        page_id: null,
        navigation_id: null
    };

    let pages = [];
    let navigations = [];

    onMount(() => {
        getPages();
        getNavigations();
    });  

    function getPages() {
        axios
            .get("http://localhost:8080/website/pages")
            .then((response) => {
                pages = [];
                for (let page of response.data) {
                    pages.push(page.id);
                }
                provision.page_id = pages[0];
            });
    }

    function getNavigations() {
        axios
            .get("http://localhost:8080/website/navigations")
            .then((response) => {
                navigations = [];
                for (let navigation of response.data) {
                    navigations.push(navigation.id);
                }
                provision.navigation_id = navigations[0];
            });
    }

    function addProvision() {
        axios
            .post("http://localhost:8080/website/provisions/", provision)
            .then((response) => {
                alert("Provision added");
                console.log(response.data);
            })
            .catch( (error) => {
                console.log(error)
                alert(error)
            });
    }
</script>

<div class="mb-5">
    <h1 class="mt-3">Add an Provision</h1>

    <p>enter date in format: "yyyy-mm-dd"</p>

    <form>
        <div class="mb-3">
            <label for="" class="form-label">Date From</label>
            <input
                class="form-control"
                type="text"
                bind:value={provision.dateFrom}
            />
        </div>
        <div class="mb-3">
            <label for="" class="form-label">Date To</label>
            <input
                class="form-control"
                type="text"
                bind:value={provision.dateTo}
            />
        </div>
        <div class="mb-3">
            <label for="" class="form-label">Page</label>
            <select bind:value={provision.page_id} class="form-select">
                {#each pages as name}
                    <option>{name}</option>
                {/each}
            </select>
        </div>
        <div class="mb-3">
            <label for="" class="form-label">Navigation Layout</label>
            <select bind:value={provision.navigation_id} class="form-select">
                {#each navigations as id}
                    <option>{id}</option>
                {/each}
            </select>
        </div>
        <a href="#/provision">
            <button type="button" class="btn btn-primary">
                Back to Provisionlist
            </button>
        </a>
        <button on:click={addProvision} type="button" class="btn btn-primary">
            Add Provision
        </button>
    </form>
</div>
