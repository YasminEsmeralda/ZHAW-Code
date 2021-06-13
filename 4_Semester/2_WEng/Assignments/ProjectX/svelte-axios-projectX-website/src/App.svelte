<script>
import Router from "svelte-spa-router";
import routes from "./routes";
</script>

<!-- This part is always displayed -->
<nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container-fluid">
        <a class="navbar-brand" href="#/">Project X: Website</a>
        <button
            class="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNavDropdown"
            aria-controls="navbarNavDropdown"
            aria-expanded="false"
            aria-label="Toggle navigation"
            >
            <span class="navbar-toggler-icon" />
        </button>
        <div class="collapse navbar-collapse" id="navbarNavDropdown">
            <ul class="navbar-nav">
                <li class="nav-item">
                    <a class="nav-link" href="#/page"> Page </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="#/provision"> Provision </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="#/navigation"> Navigation </a>
                </li>
            </ul>
        </div>
    </div>
</nav>

<div class="container mt-3">
    <!-- Here we load the page depending on the current URL -->
    <Router {routes} />
</div>

