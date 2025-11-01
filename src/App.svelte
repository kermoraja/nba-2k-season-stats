<script>
  import Router from "svelte-spa-router";
  import { routes } from "./routes";
</script>

<main class="min-h-screen bg-[#000536] text-white p-8">
  <nav class="mb-8 flex gap-4 text-[#03a9f4]">
    <a href="#/">🏀 Avaleht</a>
    <a href="#/upload">⬆️ Lae üles</a>
  </nav>

  <Router {routes}/>
</main>