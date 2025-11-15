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
        <a href="#/efficiency" class="hover:text-[#03a9f4] transition-colors duration-300">Efficiency</a>
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

    <div
            id="mobile-menu"
            class="hidden md:hidden overflow-hidden transition-all duration-300 ease-in-out"
    >
      <div class="bg-gradient-to-b from-slate-900/98 to-slate-950/98 backdrop-blur-xl border-t border-slate-700/50 shadow-2xl">
        <nav class="px-4 py-6 space-y-1">

          <!-- Home -->
          <a
                  href="#/"
                  class="group flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-600/20 hover:to-cyan-600/20 transition-all duration-200 border border-transparent hover:border-blue-500/30"
          >
            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span class="text-lg">🏠</span>
            </div>
            <span class="text-slate-200 group-hover:text-white font-medium">Avaleht</span>
          </a>

          <!-- Full Statistics -->
          <a
                  href="#/full-statistics"
                  class="group flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-600/20 hover:to-cyan-600/20 transition-all duration-200 border border-transparent hover:border-blue-500/30"
          >
            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span class="text-lg">📊</span>
            </div>
            <span class="text-slate-200 group-hover:text-white font-medium">Kogu statistika</span>
          </a>

          <!-- Compare Players -->
          <a
                  href="#/compare-players"
                  class="group flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-600/20 hover:to-cyan-600/20 transition-all duration-200 border border-transparent hover:border-blue-500/30"
          >
            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span class="text-lg">⚖️</span>
            </div>
            <span class="text-slate-200 group-hover:text-white font-medium">Võrdle mängijaid</span>
          </a>

          <!-- Efficiency -->
          <a
                  href="#/efficiency"
                  class="group flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-600/20 hover:to-cyan-600/20 transition-all duration-200 border border-transparent hover:border-blue-500/30"
          >
            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span class="text-lg">📈</span>
            </div>
            <span class="text-slate-200 group-hover:text-white font-medium">Efficiency</span>
          </a>

          <!-- Upload -->
          <a
                  href="#/upload"
                  class="group flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-600/20 hover:to-cyan-600/20 transition-all duration-200 border border-transparent hover:border-blue-500/30"
          >
            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500/20 to-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span class="text-lg">📤</span>
            </div>
            <span class="text-slate-200 group-hover:text-white font-medium">Lae üles</span>
          </a>

          <!-- Game Photos -->
          <a
                  href="#/game-photos"
                  class="group flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-600/20 hover:to-cyan-600/20 transition-all duration-200 border border-transparent hover:border-blue-500/30"
          >
            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span class="text-lg">📸</span>
            </div>
            <span class="text-slate-200 group-hover:text-white font-medium">Mängu pildid</span>
          </a>

          <!-- Divider -->
          <div class="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent my-3"></div>

          <!-- Auth Section -->
          {#if $user}
            <button
                    on:click={logoutUser}
                    class="group w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-red-600/20 to-rose-600/20 hover:from-red-600/30 hover:to-rose-600/30 transition-all duration-200 border border-red-500/30 hover:border-red-500/50"
            >
              <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500/30 to-rose-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span class="text-lg">🚪</span>
              </div>
              <span class="text-red-200 group-hover:text-white font-medium">Logi välja</span>
            </button>
          {:else}
            <a
                    href="#/login"
                    class="group flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600/20 to-cyan-600/20 hover:from-blue-600/30 hover:to-cyan-600/30 transition-all duration-200 border border-blue-500/30 hover:border-blue-500/50"
            >
              <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/30 to-cyan-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span class="text-lg">🔐</span>
              </div>
              <span class="text-blue-200 group-hover:text-white font-medium">Logi sisse</span>
            </a>
          {/if}
        </nav>

        <!-- Bottom decoration -->
        <div class="h-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600"></div>
      </div>
    </div>
  </nav>

  <section class="p-8">
    <Router {routes} useHash={true} />
  </section>

  <script>
    const toggle = document.getElementById('menu-toggle');
    const menu = document.getElementById('mobile-menu');
    const menuLinks = menu.querySelectorAll('a');

    toggle.addEventListener('click', () => {
      menu.classList.toggle('hidden');
    });

    menuLinks.forEach(link => {
      link.addEventListener('click', () => {
        menu.classList.add('hidden');
      });
    });
  </script>
</main>
