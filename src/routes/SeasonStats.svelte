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

<main class="p-8 text-white bg-[#000536] min-h-screen">
    <h1 class="text-4xl font-bold text-[#03538b] mb-6">🏀 Hooaja koondstatistika</h1>

    <div class="flex flex-wrap gap-4 mb-6">
        <SeasonSelector {seasons} {selectedSeason} onChange={handleSeasonChange}/>
        <StatSelector {selectedStat} onChange={handleStatChange}/>
    </div>

    {#if loading}
        <p>⏳ Laen andmeid...</p>
    {:else}
        <TopPlayers players={topPlayers} selectedStat={selectedStat} />
        {#each Object.entries(teamStats) as [teamName, players]}
            <TeamSection teamName={teamName} players={players} selectedStat={selectedStat} />
        {/each}
    {/if}
</main>
