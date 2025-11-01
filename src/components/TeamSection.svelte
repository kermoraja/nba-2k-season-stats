<script>
    import PlayerCard from "./PlayerCard.svelte";
    export let teamName;
    export let players = [];
    export let selectedStat = "PTS";

    $: console.log("🧩", teamName, players);

    $: cleanPlayers = (players || []).filter(p => p && typeof p === 'object' && p.NAME);
    $: sorted = [...cleanPlayers].sort((a, b) => (b[selectedStat] ?? 0) - (a[selectedStat] ?? 0));
    $: top3 = sorted.slice(0, 3);
    $: others = sorted.slice(3);
</script>

<h2 class="section-title">🏀 {teamName}</h2>

<!-- Tiimi TOP 3 -->
<div class="grid top3">
    {#each top3 as p}
        <PlayerCard player={p} selectedStat={selectedStat}/>
    {/each}
</div>

<!-- Ülejäänud -->
{#if others.length > 0}
    <div class="grid others mt-4">
        {#each others as p}
            <PlayerCard player={p} selectedStat={selectedStat}/>
        {/each}
    </div>
{/if}

<style>
    .section-title {
        font-size: 1.4rem;
        font-weight: bold;
        color: #03538b;
        margin: 1.5rem 0 1rem;
    }

    .grid {
        display: grid;
        gap: 1rem;
    }

    .grid.top3 {
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    }

    .grid.others {
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        opacity: 0.9;
    }
</style>
