<script lang="ts">
  import Router from "svelte-spa-router";
  import routes from "./routes.js";
  import { user } from "./lib/stores/userStore";
  import { logoutUser } from "./lib/services/authService";
</script>

<main class="min-h-screen bg-[#000536] text-white">
  <nav class="bg-[#000a6e]/80 backdrop-blur-md border-b border-[#03538b]/40 sticky top-0 z-50">
    <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
      <div class="text-xl font-semibold text-[#03a9f4] tracking-wide">
        NBA League Stats
      </div>

      <div class="hidden md:flex gap-8 text-[#9bd4ff] font-medium items-center">
        <a href="#/" class="hover:text-[#03a9f4] transition-colors duration-300">Avaleht</a>
        <a href="#/full-statistics" class="hover:text-[#03a9f4] transition-colors duration-300">Kogu statistika</a>
        <a href="#/compare-players" class="hover:text-[#03a9f4] transition-colors duration-300">Võrdle mängijaid</a>
        <a href="#/upload" class="hover:text-[#03a9f4] transition-colors duration-300">Lae üles</a>
        <a href="#/game-photos" class="hover:text-[#03a9f4] transition-colors duration-300">Mängupildid</a>

        {#if $user}
          <button
                  on:click={logoutUser}
                  class="bg-[#03538b] hover:bg-[#046ab8] px-3 py-1 rounded-md text-white transition"
          >
            Logi välja
          </button>
        {:else}
          <a href="#/login" class="hover:text-[#03a9f4] transition-colors duration-300">Logi sisse</a>
        {/if}
      </div>

      <button id="menu-toggle" class="md:hidden text-[#03a9f4] focus:outline-none" aria-label="Ava menüü">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>

    <div id="mobile-menu" class="hidden md:hidden flex-col bg-[#000a6e]/95 text-[#9bd4ff] px-6 pb-4 space-y-3">
      <a href="#/" class="hover:text-[#03a9f4] transition-colors duration-300">Avaleht</a>
      <a href="#/full-statistics" class="hover:text-[#03a9f4] transition-colors duration-300">Kogu statistika</a>
      <a href="#/compare-players" class="hover:text-[#03a9f4] transition-colors duration-300">Võrdle mängijaid</a>
      <a href="#/upload" class="hover:text-[#03a9f4] transition-colors duration-300">Lae üles</a>
      <a href="#/game-photos" class="hover:text-[#03a9f4] transition-colors duration-300">Mängu pildid</a>

      {#if $user}
        <button
                on:click={logoutUser}
                class="bg-[#03538b] hover:bg-[#046ab8] px-3 py-2 rounded-md text-white transition text-left"
        >
          Logi välja
        </button>
      {:else}
        <a href="#/login" class="hover:text-[#03a9f4] transition-colors duration-300">Logi sisse</a>
      {/if}
    </div>
  </nav>

  <section class="p-8">
    <Router {routes} useHash={true} />
  </section>

  <script>
    const toggle = document.getElementById('menu-toggle');
    const menu = document.getElementById('mobile-menu');
    toggle.addEventListener('click', () => {
      menu.classList.toggle('hidden');
    });
  </script>
</main>
