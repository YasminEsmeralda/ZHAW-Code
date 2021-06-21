<script>
import axios from "axios";
import {
    onMount
} from "svelte";

let provisions = [];

onMount(() => {
    getProvisions();
});

function getProvisions() {
    axios
        .get("http://localhost:8080/website/provisions")
        .then((response) => {
            provisions = response.data;
        });
}

function deleteProvision(id) {
    axios
        .delete("http://localhost:8080/website/provisions/" + id)
        .then((response) => {
            alert("Provision " + id + " deleted");
            console.log(response.data);
        })
        .catch((error) => {
            console.log(error)
            alert(error)
        });
}

// Holds table sort state.  Initialized to reflect table sorted by id column ascending.
let sortBy = {
    col: "id",
    ascending: true
};

$: sort = (column) => {

    if (sortBy.col == column) {
        sortBy.ascending = !sortBy.ascending
    } else {
        sortBy.col = column
        sortBy.ascending = true
    }

    // Modifier to sorting function for ascending or descending
    let sortModifier = (sortBy.ascending) ? 1 : -1;

    let sort = (a, b) =>
        (a[column] < b[column]) ?
        -1 * sortModifier :
        (a[column] > b[column]) ?
        1 * sortModifier :
        0;

    provisions = provisions.sort(sort);
}
</script>

<div class="container">
    <h1>List of all Provisions</h1>

    <a href="#/create-provision" style="text-decoration: none;">
        <div class="d-grid gap-2">
            <button class="btn btn-outline-warning mb-3" type="button">
                + Add Provision
            </button>
        </div>
    </a>

    <table class="table">
        <thead>
            <tr>
                <th on:click={sort("id")}>ID</th>
                <th>Date</th>
                <th></th>
            </tr>
        </thead>
        <tbody>
            {#each provisions as provision}
            <tr>
                <td>
                    {provision.id}
                </td>
                <td>
                    <p>from {provision.dateFrom} until {provision.dateTo}</p>
                </td>
                <td>
                    <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                        <button on:click={deleteProvision(provision.id)} type="button" class="btn btn-outline-danger">
                            Delete
                        </button>
                    </div>
                </td>
            </tr>
            {/each}
        </tbody>
    </table>
</div> <!-- end .container -->
