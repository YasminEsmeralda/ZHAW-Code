<script>
    import axios from "axios";
    import { onMount } from "svelte";
    export let params = {};

    let navigations = [];
    let items = {};    
    let itemId;

    onMount(() => {
        getNavigations();
    });  

    $: {
        itemId = params.id;
        getItemById();
    }

    function getNavigations() {
      axios
        .get("http://localhost:8080/website/navigations/")
        .then((response) => {
                navigations = response.data;
      });
    }

    function getItemById() {
      axios
        .get("http://localhost:8080/website/items/" + itemId)
        .then((response) => {
                items = response.data;
      });
    }

</script>

<div>
    <h1>List of all available Pages</h1>

    {#each navigations as navigation}
        <!-- <p>{getItemById(navigation.id)}</p> -->
        <p>{navigation.label}</p>
        <br />
        <p>{navigation.ctrViews}</p>
    {/each}
</div>