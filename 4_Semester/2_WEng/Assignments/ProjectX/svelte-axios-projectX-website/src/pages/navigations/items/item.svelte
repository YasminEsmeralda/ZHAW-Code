<script>
import axios from "axios";
import {
    onMount
} from "svelte";
import BackButton from "../../reusable/backButton.svelte";

let items = [];

onMount(() => {
    getItems();
});

function getItems() {
    axios
        .get("http://localhost:8080/website/items")
        .then((response) => {
            items = response.data;
        });
}

function deleteItems(id, pos) {
    axios
        .delete("http://localhost:8080/website/items/" + id)
        .then((response) => {
            alert("Item " + items[pos].id + ": " + items[pos].layout + " deleted");
            console.log(response.data);
        })
        .catch((error) => {
            console.log(error)
            alert(error)
        });
}
</script>

<div class="container">
    <h1>List of all available Items</h1>

    <a href="#/create-item" style="text-decoration: none;">
        <div class="d-grid gap-1">
            <button class="btn btn-outline-warning mb-3" type="button">
                + Add Item
            </button>
        </div>
    </a>

    <BackButton />

    <table class="table">
        <thead>
            <tr>
                <th>ID</th>
                <th>Layout</th>
                <th>Views</th>
                <th></th>
            </tr>
        </thead>
        <tbody>
            {#each items as item, pos}
            <tr>
                <td>
                    {item.id}
                </td>
                <td>
                    {item.layout}
                </td>
                <td>
                    {item.ctrViews}
                </td>
                <td>
                    <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                        <button on:click={deleteItems(item.id, pos)} type="button" class="btn btn-outline-danger">
                            Delete
                        </button>
                    </div> <!-- end .d-grid gap-2 d-md-flex justify-content-md-end -->
                </td>
            </tr>
            {/each}
        </tbody>
    </table>
</div> <!-- end .container -->
