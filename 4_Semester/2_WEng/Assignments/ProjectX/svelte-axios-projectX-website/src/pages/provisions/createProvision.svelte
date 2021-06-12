<script>
    import axios from "axios";
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
                    pages.push(page.id + " - " + page.name);
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
                    navigations.push(navigation.id + " - " + navigation.layout);
                }
                provision.navigation_id = navigations[0];
            });
    }

    function addProvision() {

        let pageComponents = provision.page_id.split("-");
        let navigationComponents = provision.navigation_id.split("-");
       
        provision.page_id= pageComponents[0];
        provision.navigation_id = navigationComponents[0];

        axios
            .post("http://localhost:8080/website/provisions", provision)
            .then((response) => {
                alert("Provision added");
                provision.dateFrom = null;
                provision.dateTo = null;
                provision.page_id = null;
                provision.navigation_id = null;
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

    <form>
        <div class="mb-3">
            <label for="" class="form-label">Date From</label>
            <input
                class="form-control"
                type="date"
                bind:value={provision.dateFrom}
            />
        </div>
        <div class="mb-3">
            <label for="" class="form-label">Date To</label>
            <input
                class="form-control"
                type="date"
                bind:value={provision.dateTo}
            />
        </div>
        <div class="mb-3">
            <label for="" class="form-label">Page</label>
            <select bind:value={provision.page_id} class="form-select">
                {#each pages as id}
                    <option>{id}</option>
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
        <div>
            <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                <button on:click={addProvision} type="button" class="btn btn-warning">
                    Add Provision
                </button>
                <a href="#/provision">
                    <button type="button" class="btn btn-outline-warning">
                        Back to Provisionverview
                    </button>
                </a> 
        </div>
    </form>
</div>
