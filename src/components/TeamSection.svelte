<script>
    import PlayerCard from "./PlayerCard.svelte";

    export let teamName;
    export let players = [];
    export let selectedStat = "PTS";

    $: cleanPlayers = (players || []).filter(p => p && typeof p === 'object' && p.NAME);
    $: sorted = [...cleanPlayers].sort((a, b) => (b[selectedStat] ?? 0) - (a[selectedStat] ?? 0));
    $: top3 = sorted.slice(0, 3);
    $: others = sorted.slice(3);
</script>

<section class="w-full max-w-7xl mx-auto px-4 mt-8">
    <h3 class="text-2xl font-bold text-[#03A9F4] mb-4 uppercase">{teamName}</h3>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-center">
        {#each top3 as p}
            <a
                    href={"#/player/" + p.NAME.replace(/\./g, "~").replace(/\s+/g, "-")}
                    class="w-full max-w-sm transition-transform hover:scale-[1.02]"
            >
                <PlayerCard player={p} {selectedStat} />
            </a>
        {/each}
    </div>

    {#if others.length > 0}
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6 justify-items-center">
            {#each others as p}
                <a href={"#/player/" + p.NAME.replace(/\./g, "~").replace(/\s+/g, "-")}
                        class="w-full max-w-sm transition-transform hover:scale-[1.02]"
                >
                    <PlayerCard player={p} {selectedStat} />
                </a>
            {/each}
        </div>
    {/if}
</section>
