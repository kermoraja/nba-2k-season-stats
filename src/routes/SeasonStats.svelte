<script>
    import { onMount } from "svelte";
    import { getAvailableSeasons, getSeasonStats } from "../lib/services/statsService";
    import StatSelector from "../components/StatSelector.svelte";
    import TopPlayers from "../components/TopPlayers.svelte";
    import TeamSection from "../components/TeamSection.svelte";
    import TeamSummary from "../components/TeamSummary.svelte";
    import { getImageUrl } from "../lib/utils/images.js";

    let seasons = [];
    let selectedSeason = "";
    let selectedStat = "PTS";
    let topPlayers = [];
    let teamStats = {};
    let mvpPlayer = null;
    let runnerUp = null;
    let loading = true;

    onMount(async () => {
        seasons = await getAvailableSeasons();
        selectedSeason = seasons.at(-1);
        await loadStats();
    });

    async function loadStats() {
        loading = true;
        const { players, teams } = await getSeasonStats(selectedSeason);
        teamStats = teams;

        players.forEach(p => {
            const FG_PCT = Number(p.FG_PCT) || 0;
            const TP_PCT = Number(p.TP_PCT) || 0;
            const FT_PCT = Number(p.FT_PCT) || 0;
            const PTS = Number(p.PTS) || 0;
            const REB = Number(p.REB) || 0;
            const AST = Number(p.AST) || 0;
            const STL = Number(p.STL) || 0;
            const BLK = Number(p.BLK) || 0;
            const TO = Number(p.TO) || 0;
            const MIN = Number(p.MIN) || 0;
            const GAMES = Number(p.GAMES) || 0;

            const efficiencyBoost =
                ((FG_PCT - 50) * 0.25) +
                ((TP_PCT - 35) * 0.15) +
                ((FT_PCT - 75) * 0.05);

            const GIS = PTS + 1.2 * REB + 1.5 * AST + 3 * STL + 2.5 * BLK - 1.3 * TO + efficiencyBoost;
            const minuteFactor = MIN / 28;
            const playFactor = Math.pow(GAMES / 7, 1.4);
            p.mvpIndex = GIS * minuteFactor * playFactor;
        });

        const sortedByMVP = [...players].sort((a, b) => b.mvpIndex - a.mvpIndex);
        mvpPlayer = sortedByMVP[0];
        runnerUp = sortedByMVP[1];
        topPlayers = [...players].sort((a, b) => b[selectedStat] - a[selectedStat]).slice(0, 5);
        loading = false;

        for (const teamName in teamStats) {
            const players = teamStats[teamName];
            teamStats[teamName].averages = calculateTeamAverages(players);
        }
    }

    function calculateTeamAverages(players) {
        const totals = {};
        const count = players.length;
        const keys = ["PTS", "REB", "AST", "STL", "BLK", "TO", "MIN"];
        keys.forEach(key => {
            const total = players.reduce((sum, p) => sum + (Number(p[key]) || 0), 0);
            totals[key] = (total / count).toFixed(1);
        });
        return totals;
    }

    function handleSeasonChange(season) {
        selectedSeason = season;
        loadStats();
    }

    function handleStatChange(stat) {
        selectedStat = stat;
        loadStats();
    }

    function round(num, decimals = 2) {
        return Number(num)?.toFixed(decimals);
    }

    function getImage(player) {
        return getImageUrl(player.NAME) || getImageUrl("default_player");
    }
</script>

<main class="min-h-screen bg-gradient-to-b from-[#000a26] to-[#001a45] text-white flex flex-col items-center px-4 md:px-6 py-8 md:py-12">
    <!-- Header -->
    <header class="w-full max-w-7xl text-center mb-8 md:mb-10">
        <h1 class="text-3xl md:text-5xl font-extrabold text-[#00b0ff] drop-shadow-lg mb-3 md:mb-4">
            2K League Stats
        </h1>
        <p class="text-gray-300 text-sm md:text-base">Ülevaade hooaja tipphetkedest ja tiimide statistikast</p>
    </header>

    <!-- 1. Season Selector - Full Width -->
    <div class="w-full flex justify-center mt-6 mb-6">
        <div class="flex items-center gap-3">
            {#each seasons as season, i}
                <button
                        class={`w-12 h-12 flex items-center justify-center rounded-full
                    text-base font-semibold transition-all duration-200 backdrop-blur-md
                    ${season === selectedSeason
                        ? 'bg-blue-600/90 text-white ring-4 ring-blue-400/40 shadow-xl shadow-blue-500/40 scale-110'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:scale-105 hover:shadow-md'
                    }`}
                        on:click={() => handleSeasonChange(season)}
                >
                    {i + 1}
                </button>
            {/each}
        </div>
    </div>

    {#if loading}
        <div class="flex flex-col items-center justify-center py-20">
            <div class="animate-spin rounded-full h-16 w-16 border-4 border-slate-600 border-t-blue-500 mb-4"></div>
            <p class="text-gray-400 text-sm">Laen andmeid...</p>
        </div>
    {:else}
        <!-- 2. MVP/Runner-Up + Team Summary - Side by Side -->
        <section class="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <!-- MVP & Runner-Up -->
            <div class="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 shadow-xl">
                <h3 class="text-xl font-bold text-gray-200 mb-6 text-center">🏆 Hooaja Parimad</h3>

                <div class="space-y-4">
                    {#if mvpPlayer}
                        <div class="bg-gradient-to-br from-[#03538b]/60 to-[#001f4d]/80 rounded-xl border border-[#00b0ff]/30 p-6 flex flex-col items-center text-center shadow-lg hover:scale-[1.02] transition">
                            <div class="text-[#00b0ff] text-sm font-bold mb-3">🏆 MVP</div>
                            <img src={getImage(mvpPlayer)} alt={mvpPlayer.name}
                                 class="w-24 h-24 rounded-full border-4 border-[#00b0ff] shadow-md mb-3"/>
                            <div class="text-xl font-bold">{mvpPlayer.name}</div>
                            <div class="text-sm text-gray-300 mt-1">MVP indeks: {round(mvpPlayer.mvpIndex)}</div>
                        </div>
                    {/if}

                    {#if runnerUp}
                        <div class="bg-gradient-to-br from-[#022c58]/60 to-[#001233]/80 rounded-xl border border-[#03538b]/40 p-5 flex flex-col items-center text-center shadow-md hover:scale-[1.02] transition">
                            <div class="text-[#8fd6ff] text-sm font-bold mb-2">🥈 Runner-Up</div>
                            <img src={getImage(runnerUp)} alt={runnerUp.name}
                                 class="w-20 h-20 rounded-full border-2 border-[#03538b] mb-2"/>
                            <div class="text-lg font-semibold">{runnerUp.name}</div>
                            <div class="text-xs text-gray-400 mt-1">MVP indeks: {round(runnerUp.mvpIndex)}</div>
                        </div>
                    {/if}
                </div>
            </div>

            <!-- Team Summary -->
            <div>
                <TeamSummary seasonName={selectedSeason}/>
            </div>
        </section>

        <!-- 3. Stat Selector - Full Width -->
        <section class="w-full max-w-7xl bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-4 md:p-6 shadow-xl mb-8">
            <div class="flex flex-col items-center">
                <h3 class="text-sm text-gray-300 mb-3">Vali statistika TOP 5 mängijate jaoks</h3>
                <StatSelector {selectedStat} onChange={handleStatChange}/>
            </div>
        </section>

        <!-- 4. Top Players -->
        <div class="w-full max-w-7xl mb-8">
            <TopPlayers players={topPlayers} {selectedStat}/>
        </div>

        <!-- 5. Team Sections -->
        <div class="w-full max-w-7xl space-y-8">
            {#each Object.entries(teamStats) as [teamName, players]}
                <TeamSection {teamName} {players} {selectedStat}/>
            {/each}
        </div>
    {/if}
</main>