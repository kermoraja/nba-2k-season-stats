<script>
    export let playerName;
    export let playerImageUrl;
    export let playerOverall;
    export let editingOverall;
    export let newOverall;
    export let playedSeasons;
    export let selectedSeason;

    export let onStartEditingOverall;
    export let onSaveOverall;
    export let onSeasonChange;
</script>

<div class="flex items-center gap-6 mb-6">
    <img src={playerImageUrl} class="w-28 h-28 rounded-xl border-2 border-[#03538b] object-cover" />

    <div>
        <h1 class="text-4xl font-bold text-[#03a9f4] mb-1">{playerName}</h1>

        {#if playerOverall !== null}
            <div class="flex items-center gap-2 mb-2">
                <span class="text-sm opacity-80">Overall:</span>

                {#if editingOverall}
                    <input type="number" bind:value={newOverall} class="w-16 px-2 py-1 text-sm bg-[#002366] border border-[#03538b] rounded"/>
                    <button on:click={onSaveOverall} class="px-2 bg-[#03538b] rounded">💾</button>
                {:else}
                    <span class="text-xl font-bold text-yellow-400">{playerOverall}</span>
                    <button class="px-2 bg-[#03538b] rounded text-xs" on:click={onStartEditingOverall}>✏️</button>
                {/if}
            </div>
        {/if}

        <label class="opacity-80">Hooaeg:</label>
        <select bind:value={selectedSeason}
                on:change={onSeasonChange}
                class="ml-2 bg-[#03538b] rounded px-2 py-1 border border-[#046ab8]">
            {#each playedSeasons as s}
                <option value={s}>{s}</option>
            {/each}
        </select>
    </div>
</div>
