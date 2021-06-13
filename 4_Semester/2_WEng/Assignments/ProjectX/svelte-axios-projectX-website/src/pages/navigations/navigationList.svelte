<script>
import axios from "axios";
import {
    onMount
} from "svelte";
import BackButton from "../reusable/backButton.svelte";

let navigations = [];

onMount(() => {
    getNavigations();
});

function getNavigations() {
    axios
        .get("http://localhost:8080/website/navigations/")
        .then((response) => {
            navigations = response.data;
        });
}
</script>

<div class="container">
    <h1>List of all available Navigations</h1>

    <BackButton />

    <div class="accordion" id="accordionExample">
        {#each navigations as navigation}
        <div class="accordion-item">
            <h2 class="accordion-header" id="heading{navigation.id}">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse{navigation.id}" aria-expanded="true" aria-controls="collapse{navigation.id}">
                    {#if navigation.label != null}
                    <strong>Menu: {navigation.label}</strong>
                    {:else}
                    <strong>Item: {navigation.layout} with {navigation.ctrViews}</strong>
                    {/if}
                </button>
            </h2>
            <div id="collapse{navigation.id}" class="accordion-collapse collapse" aria-labelledby="heading{navigation.id}" data-bs-parent="#accordionExample">
                <div class="accordion-body">
                    <p><strong>Layout: </strong>{navigation.layout}</p>
                    {#if navigation.navigations != null}
                    <th><p><strong>This Navigation provides the following Navigations</strong></p></th>
                    
                    <table class="table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Navigation</th>
                                <th>Label</th>
                                <th>Views</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each navigation.navigations as children}
                            <tr>
                                <td>{children.id}</td>
                                {#if children.label != null}
                                <td>Menu</td>
                                <td>{children.label}</td>
                                <td>-</td>
                                {:else}
                                <td>Item</td>
                                <td>-</td>
                                <td>{children.ctrViews}</td>
                                {/if}
                            </tr>
                            {/each}

                        </tbody>
                    </table>
                    {:else}
                    <p> no sub navigations found</p>
                    {/if}
                </div>
            </div>
        </div>
        {/each}
    </div> <!-- endo .accordion according-flush mb-1 -->
</div> <!-- end .container -->
