<script>
import axios from "axios";
import {
    onMount
} from "svelte";

let pages = [];

onMount(() => {
    getPages();
});

function getPages() {
    axios
        .get("http://localhost:8080/website/pages")
        .then((response) => {
            pages = response.data;
        });
}

function deletePage(id, pos) {
    axios
        .delete("http://localhost:8080/website/pages/" + id)
        .then((response) => {
            alert("Page " + pages[pos].name + " deleted");
            console.log(response.data);
        })
        .catch((error) => {
            console.log(error)
            alert(error)
        });
}
</script>

<div class="container">
    <h1>List of all available Pages</h1>

    <a href="#/create-page" style="text-decoration: none;">
        <div class="d-grid gap-1">
            <button class="btn btn-outline-warning mb-3" type="button">
                + Add Page
            </button>
        </div>
    </a>

    <div class="accordion according-flush mb-1" id="accordingFlush">
        {#each pages as page, pos}
        <div class="accordion-item">
            <h2 class="accordion-header" id="flush-heading{page.id}">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapse{page.id}" aria-expanded="false" aria-controls="flush-collapse{page.id}">
                    <strong>{page.name}</strong>
                </button>
            </h2>
            <div id="flush-collapse{page.id}" class="accordion-collapse collapse" aria-labelledby="flush-heading{page.id}" data-bs-parent="#accordingFlush">
                <div class="accordion-body">
                    <p><strong>Language: </strong>{page.language}</p>
                    <p><strong>This Page provides the following Provisions</strong></p>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each page.provisions as provision}
                            <tr>
                                <td>
                                    {provision.id}
                                </td>
                                <td>
                                    <p>from {provision.dateFrom} until {provision.dateTo}</p>
                                </td>
                            </tr>
                            {/each}
                        </tbody>
                    </table>
                    <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                        <button on:click={deletePage(page.id, pos)} type="button" class="btn btn-outline-danger">
                            Delete Page
                        </button>
                    </div> <!-- end .d-grid gap-2 d-md-flex justify-content-md-end -->
                </div> <!-- end .accordion-body -->
            </div> <!-- end .flush-collapse{page.id} -->
        </div> <!-- end .accordion-item -->
        {/each}
    </div> <!-- end .accordion according-flush mb-1 -->
</div> <!-- end .container -->
