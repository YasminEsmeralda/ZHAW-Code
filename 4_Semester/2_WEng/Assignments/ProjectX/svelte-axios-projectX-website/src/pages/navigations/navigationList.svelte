<script>
    import axios from "axios";
    import { onMount } from "svelte";
import { empty } from "svelte/internal";
    import BackButton from "../reusable/backButton.svelte";
import Navigation from "./navigation.svelte";
   

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

<div>
    <h1>List of all available Navigations</h1>

    <BackButton />

    {#each navigations as navigation}
        <div class="accordion according-flush mb-1" id="accordingFlush{navigation.id}">
        <div class="accordion-item">
            <h2 class="accordion-header" id="flush-heading{navigation.id}">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse{navigation.id}" aria-expanded="true" aria-controls="collapse{navigation.id}">
                <strong>{navigation.label}</strong>
            </button>
            </h2>
            <div id="collapse{navigation.id}" class="accordion-collapse collapse" aria-labelledby="flush-heading{navigation.id}" data-bs-parent="#accordingFlush{navigation.id}">
            <div class="accordion-body">
                <p><strong>Layout: </strong>{navigation.layout}</p>
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
                            <td>
                                {children.id}
                            </td>
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
            </div>
          </div>
        </div>
      </div>
    {/each}
</div>