<script>
    let products = [
        {
            id: 0,
            name: "Superbike",
        },
        {
            id: 1,
            name: "Ultrabike",
        },
    ];
</script>

<h1>Products</h1>
<ul>
    <!-- 
        TODO: Use an #each-block to display the "name" of all products as link in a list item. 
        This means that in the end a list like this should be generated:

        <ul>
          <li><a href="#/products/0">Superbike</a></li>
          <li><a href="#/products/1">Ultrabike</a></li>
        </ul>

        Hint: You can generate the value of the "href" attribute in curly brackets, e.g.,

        <a href={"#/products/" + 1}>...</a>
    -->
    {#each products as product}
        <li><a href={"#/products/" + product.id}> {product.name}</a></li>
    {/each}
</ul>
