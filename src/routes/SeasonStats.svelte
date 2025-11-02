<script>
    import { onMount } from "svelte";
    import { getAvailableSeasons, getSeasonStats } from "../lib/services/statsService";
    import SeasonSelector from "../components/SeasonSelector.svelte";
    import StatSelector from "../components/StatSelector.svelte";
    import TopPlayers from "../components/TopPlayers.svelte";
    import TeamSection from "../components/TeamSection.svelte";

    let seasons = [];
    let selectedSeason = "";
    let selectedStat = "PTS";
    let topPlayers = [];
    let teamStats = {};
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
</script>

<main class="min-h-screen bg-[#000536] text-white px-8 py-10 md:px-10 md:py-12 flex flex-col items-center">
    <h1 class="text-3xl md:text-4xl font-bold text-[#03538b] mb-8 text-center flex items-center gap-2">
        🏀 Hooaja koondstatistika
    </h1>
    <div class="flex flex-col md:flex-row items-center justify-center gap-6 w-full max-w-2xl mb-12">
        <div class="flex flex-col items-center w-full md:w-1/2">
            <SeasonSelector {seasons} {selectedSeason} onChange={handleSeasonChange} />
        </div>

        <div class="flex flex-col items-center w-full md:w-1/2">
            <StatSelector {selectedStat} onChange={handleStatChange} />
        </div>
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
