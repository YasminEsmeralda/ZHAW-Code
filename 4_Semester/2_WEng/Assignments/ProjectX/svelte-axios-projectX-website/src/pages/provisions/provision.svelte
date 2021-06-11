<script>
    import axios from "axios";
    import { onMount } from "svelte";

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
                alert("Provision deleted");
                console.log(response.data);
            })
            .catch( (error) => {
                console.log(error)
                alert(error)
            });
    }

</script>

<div>
    <h1>List of all Provisions</h1>
    
    <a href="#/create-provision" style="text-decoration: none;">
      <div class="d-grid gap-2">
        <button class="btn btn-outline-warning mb-3" type="button">
          + Add Provision
      </button>
      </div>
    </a>

      <p><strong>This Page provides the following Provisions</strong></p>
      <table class="table">
        <thead>
            <tr>
                <th>ID</th>
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
</div>