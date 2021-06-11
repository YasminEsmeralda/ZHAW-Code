<script>
  import axios from "axios";
  import { onMount } from "svelte";
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

  function deleteItems(id) {
      axios
        .delete("http://localhost:8080/website/items/" + id)
        .then((response) => {
                alert("Item deleted");
                console.log(response.data);
            })
            .catch( (error) => {
                console.log(error)
                alert(error)
            });
    }

</script>

<div>
  <h1>List of all available Menu</h1>

  <a href="#/create-item" style="text-decoration: none;">
    <div class="d-grid gap-1">
      <button class="btn btn-outline-warning mb-3" type="button">
        + Add Menu
    </button>
    </div>
  </a>

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
      {#each items as item}
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
                <button on:click={deleteItems(item.id)} type="button" class="btn btn-outline-danger">
                    Delete
                </button>
              </div>
            </td>
        </tr>
      {/each}
    </tbody>
  </table>
<BackButton />
</div>