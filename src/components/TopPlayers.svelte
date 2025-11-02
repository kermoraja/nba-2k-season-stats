<script lang="ts">
    import PlayerCard from "./PlayerCard.svelte";
    import type { PlayerStats } from "../lib/services/statsService";

    export let players: PlayerStats[] = [];
    export let selectedStat = "PTS";
</script>

<section class="w-full max-w-7xl mx-auto px-4">
    <h2 class="text-xl md:text-2xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
        🔥 Top 5 mängijat ({selectedStat})
    </h2>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 justify-items-center">
        {#each players as p}
            <a
                    href={"#/player/" + p.NAME.replace(/\./g, "-").replace(/\s+/g, "")}
                    class="w-full max-w-sm transition-transform hover:scale-[1.02]"
            >
                <PlayerCard player={p} {selectedStat} />
            </a>
        {/each}
    </div>
</section>