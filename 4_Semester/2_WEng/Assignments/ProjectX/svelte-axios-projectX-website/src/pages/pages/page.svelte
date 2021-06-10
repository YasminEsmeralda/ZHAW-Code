<script>
    import axios from "axios";
    import { onMount } from "svelte";

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

</script>

<div>
    <h1>List of all available Pages</h1>

  {#each pages as page}
  <div class="accordion" id="{page.id}">
    <div class="accordion-item">
      <h2 class="accordion-header" id="heading{page.id}">
        <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapse{page.id}" aria-expanded="true" aria-controls="collapse{page.id}">
          <strong>{page.name}</strong>
        </button>
      </h2>
      <div id="collapse{page.id}" class="accordion-collapse collapse" aria-labelledby="heading{page.id}" data-bs-parent="#{page.id}">
        <div class="accordion-body">
          <p><strong>Language: </strong>{page.language}</p>
          <p><strong>This Page provides the following Provisions</strong></p>
          <table class="table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Date From</th>
                    <th>Date To</th>
                </tr>
            </thead>
            <tbody>
                {#each page.provisions as provision}
                    <tr>
                        <td>
                            {provision.id}
                        </td>
                        <td>
                            {provision.dateFrom}
                        </td>
                        <td>
                            {provision.dateTo}
                        </td>
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