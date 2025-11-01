<script>
    import { onMount } from "svelte";
    import { getAvailableSeasons, getSeasonStats } from "../lib/services/statsService";
    import PlayerCard from "./PlayerCard.svelte";
    import StatSelector from "./StatSelector.svelte";
    import SeasonSelector from "./SeasonSelector.svelte";

    let seasons = [];
    let selectedSeason = "";
    let selectedStat = "PTS";
    let teamStats = {};
    let topPlayers = [];
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
</script>

<main>
    <SeasonSelector {seasons} bind:selectedSeason on:change={loadStats}/>
    <StatSelector bind:selectedStat on:change={loadStats}/>
    {#if !loading}
        <section>
            <h2>Top 5 ({selectedStat})</h2>
            <div class="grid">
                {#each topPlayers as p}
                    <PlayerCard {p} {selectedStat}/>
                {/each}
            </div>
        </section>
    {/if}
</main>
