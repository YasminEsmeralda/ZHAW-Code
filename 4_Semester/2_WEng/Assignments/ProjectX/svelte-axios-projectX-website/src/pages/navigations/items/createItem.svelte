<script>
    import axios from "axios";
    import { onMount } from "svelte";

    let item = {
        layout: "",
        ctrViews: null,
        menu_id: -1
    };

    let menus = [];

    onMount(() => {
        getMenus();
    });  

    function getMenus() {
        axios
            .get("http://localhost:8080/website/menus")
            .then((response) => {
                menus = [];
                for (let menu of response.data) {
                    menus.push(menu.id);
                }
                item.menu_id = menus[0];
            });
    }

    function addItem() {
        axios
            .post("http://localhost:8080/website/items/" + item.menu_id, item)
            .then((response) => {
                alert("Item added");
                item.layout = "";
                item.ctrViews = null;
                item.menu_id = null;
                console.log(response.data);
            })
            .catch( (error) => {
                console.log(error)
                alert(error)
            });
    }
</script>

<div class="mb-5">
    <h1 class="mt-3">Add an Item</h1>

    <form>
        <div class="mb-3">
            <label for="" class="form-label">Layout</label>
            <input
                class="form-control"
                type="text"
                bind:value={item.layout}
            />
        </div>
        <div class="mb-3">
            <label for="" class="form-label">Views</label>
            <input
                class="form-control"
                type="text"
                bind:value={item.ctrViews}
            />
        </div>
        <div class="mb-3">
            <label for="" class="form-label">Menu auswählen</label>
            <select bind:value={item.menu_id} class="form-select">
                {#each menus as id}
                    <option>{id}</option>
                {/each}
            </select>
        </div> 
        <div>
            <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                <button on:click={addItem} type="button" class="btn btn-warning">
                    Add Item
                </button>
                <a href="#/navigation">
                    <button type="button" class="btn btn-outline-warning">
                        Back to Item overview
                    </button>
                </a> 
            </div>
        </div>
    </form>
</div>