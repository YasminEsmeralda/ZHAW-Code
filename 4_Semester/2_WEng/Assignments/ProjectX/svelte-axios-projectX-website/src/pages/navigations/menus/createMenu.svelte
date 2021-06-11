<script>
    import axios from "axios";
    import { onMount } from "svelte";

    let menu = {
        layout: "",
        label:"",
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
                    menus.push(menu.id + " - " + menu.label);
                }
                menu.menu_id = menus[0];
            });
    }

    function addMenu() {

        let menuComponents = menu.menu_id.split("-");

        axios
            .post("http://localhost:8080/website/menus/" + menuComponents[0], menu)
            .then((response) => {
                alert("Menu" + menuComponents[1] + "added");
                menu.layout = "";
                menu.label = "";
                menu.menu_id = -1;
                console.log(response.data);
            })
            .catch( (error) => {
                console.log(error)
                alert(error)
            });
    }
</script>

<div class="mb-5">
    <h1 class="mt-3">Add an Menu</h1>

    <form>
        <div class="mb-3">
            <label for="" class="form-label">Layout</label>
            <input
                class="form-control"
                type="text"
                bind:value={menu.layout}
            />
        </div>
        <div class="mb-3">
            <label for="" class="form-label">Label</label>
            <input
                class="form-control"
                type="text"
                bind:value={menu.label}
            />
        </div>
        <div class="mb-3">
            <label for="" class="form-label">Menu auswählen</label>
            <select bind:value={menu.menu_id} class="form-select">
                {#each menus as id}
                    <option>{id}</option>
                {/each}
            </select>
        </div> 
        <div>
            <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                <button on:click={addMenu} type="button" class="btn btn-warning">
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