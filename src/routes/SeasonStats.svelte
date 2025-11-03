<script>
    import { onMount } from "svelte";
    import { getAvailableSeasons, getSeasonStats } from "../lib/services/statsService";
    import SeasonSelector from "../components/SeasonSelector.svelte";
    import StatSelector from "../components/StatSelector.svelte";
    import TopPlayers from "../components/TopPlayers.svelte";
    import TeamSection from "../components/TeamSection.svelte";
    import {getImageUrl} from "../lib/utils/images.js";

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
        selectedSeason = seasons[0];
        await loadStats();
    });

    async function loadStats() {
        loading = true;
        const { players, teams } = await getSeasonStats(selectedSeason);
        teamStats = teams;

        players.forEach(p => {
            const missedFG = p.FG_ATT - p.FG_MADE;
            const missedFT = p.FT_ATT - p.FT_MADE;
            p.mvpIndex = (p.PTS + p.REB + p.AST + p.STL + p.BLK) - (missedFG + missedFT + p.TO);
        });

        const sortedByMVP = [...players].sort((a, b) => b.mvpIndex - a.mvpIndex);
        mvpPlayer = sortedByMVP[0];
        runnerUp = sortedByMVP[1];

        topPlayers = [...players].sort((a, b) => b[selectedStat] - a[selectedStat]).slice(0, 5);
        loading = false;
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
        const imagePath = getImageUrl(player.NAME);
        const defaultImage = getImageUrl("default_player");
        return imagePath || defaultImage;
    }
</script>

<main class="min-h-screen bg-[#000536] text-white px-8 py-10 md:px-10 md:py-12 flex flex-col items-center">
    <h1 class="text-3xl md:text-4xl font-bold text-[#03538b] mb-8 text-center flex items-center gap-2">
        🏀 Hooaja koondstatistika
    </h1>

    <div class="flex flex-col md:flex-row items-center justify-center gap-6 w-full max-w-5xl mb-12">
        <div class="flex flex-col items-center w-full md:w-1/3">
            <SeasonSelector {seasons} {selectedSeason} onChange={handleSeasonChange} />
        </div>

        <div class="flex flex-col items-center w-full md:w-1/3">
            <StatSelector {selectedStat} onChange={handleStatChange} />
        </div>

        {#if mvpPlayer}
            <div class="flex flex-col items-center bg-[#03538b]/20 border border-[#03538b]/40 rounded-2xl p-4 w-full md:w-1/3 text-center shadow-lg">
                <h2 class="text-xl font-semibold text-[#00b0ff] mb-2">🏆 {mvpPlayer.name}</h2>
                <img src={getImage(mvpPlayer)} alt={mvpPlayer.name} class="w-20 h-20 object-cover rounded-full mb-2 border-2 border-[#03538b]" />
                <p class="text-sm text-[#00b0ff] font-semibold">MVP skoor: {round(mvpPlayer.mvpIndex)}</p>

                {#if runnerUp}
                    <div class="mt-4 bg-[#03538b]/10 border border-[#03538b]/30 rounded-xl p-3 w-full">
                        <h3 class="text-sm font-semibold text-[#8fd6ff] mb-1">🥈 Runner-up: {runnerUp.name}</h3>
                        <div class="flex items-center justify-center gap-2">
                            <img src={getImage(runnerUp)} alt={runnerUp.name} class="w-10 h-10 object-cover rounded-full border border-[#03538b]" />
                            <div class="text-xs opacity-80 text-left">
                                <div>MVP skoor: {round(runnerUp.mvpIndex)}</div>
                            </div>
                        </div>
                    </div>
                {/if}
            </div>
        {/if}

    </div>

    {#if loading}
        <p class="text-center">⏳ Laen andmeid...</p>
    {:else}
        <TopPlayers players={topPlayers} {selectedStat} />

        {#each Object.entries(teamStats) as [teamName, players]}
            <TeamSection {teamName} {players} {selectedStat} />
        {/each}
    {/if}
</main>