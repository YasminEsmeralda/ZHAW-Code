<script>
  import axios from "axios";
  import { onMount } from "svelte";
  import BackButton from "../../reusable/backButton.svelte";

  let menus = [];

  onMount(() => {
    getMenus();
  });  

  function getMenus() {
    axios
      .get("http://localhost:8080/website/menus")
      .then((response) => {
              menus = response.data;
    });
  }

  function deleteMenu(id) {
      axios
        .delete("http://localhost:8080/website/menus/" + id)
        .then((response) => {
                alert("Menu deleted");
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

  <a href="#/create-menu" style="text-decoration: none;">
    <div class="d-grid gap-1">
      <button class="btn btn-outline-warning mb-3" type="button">
        + Add Menu
    </button>
    </div>
  </a>

{#each menus as menu}
<div class="accordion according-flush mb-1" id="according{menu.id}">
  <div class="accordion-item">
    <h2 class="accordion-header" id="flush-heading{menu.id}">
      <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapse{menu.id}" aria-expanded="true" aria-controls="collapse{menu.id}">
        <strong>Label: {menu.label}</strong>
      </button>
    </h2>
    <div id="collapse{menu.id}" class="accordion-collapse collapse" aria-labelledby="flush-heading{menu.id}" data-bs-parent="#according{menu.id}">
      <div class="accordion-body">
        <p><strong>layout: </strong>{menu.layout}</p>
        <p><strong>This menu contains the following menus and items</strong></p>
        <table class="table">
          <thead>
              <tr>
                  <th>ID</th>
                  <th>Layout</th>
              </tr>
          </thead>
          <tbody>
              {#each menu.navigations as navigation}
                  <tr>
                      <td>
                          {navigation.id}
                      </td>
                      <td>
                          {navigation.layout}
                      </td>
                  </tr>
              {/each}
          </tbody>
        </table>
        <div class="d-grid gap-2 d-md-flex justify-content-md-end">
          <button on:click={deleteMenu(menu.id)} type="button" class="btn btn-outline-danger">
              Delete Page
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
{/each}
<BackButton />
</div>