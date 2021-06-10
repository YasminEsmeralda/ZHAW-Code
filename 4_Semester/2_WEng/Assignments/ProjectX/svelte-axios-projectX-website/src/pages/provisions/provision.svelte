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

</script>

<div>
    <h1>List of all Provisions</h1>
    <div>
      <a href="#/create-provision">
        <button type="button" class="btn btn-danger">
          + Add Provision
        </button>
      </a>
  </div>
      <p><strong>This Page provides the following Provisions</strong></p>
      <table class="table">
        <thead>
            <tr>
                <th>ID</th>
                <th>Date</th>
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
                </tr>
                {/each}
        </tbody>
      </table>
</div>