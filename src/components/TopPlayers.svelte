<script lang="ts">
    import PlayerCard from "./PlayerCard.svelte";
    import type { PlayerStats } from "../lib/services/statsService";

    export let players: PlayerStats[] = [];
    export let selectedStat = "PTS";
</script>

<section>
    <h2 class="section-title">🔥 Top 5 mängijat ({selectedStat})</h2>

    <div class="grid">
        {#each players as p}
            <PlayerCard player={p} selectedStat={selectedStat}/>
        {/each}
    </div>
</section>

<style>
    .section-title {
        font-size: 1.4rem;
        color: #ffcc00;
        font-weight: bold;
        margin: 1rem 0;
    }
    .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 1rem;
    }
</style>
