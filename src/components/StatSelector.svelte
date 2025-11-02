<script lang="ts">
    export let statOptions = ["PTS", "REB", "AST", "STL", "BLK", "TO", "MIN"];
    export let selectedStat = "PTS";
    export let onChange = (stat: string) => {};

    function handleSelect(stat: string) {
        selectedStat = stat;
        onChange(stat);
    }
</script>

<div class="flex flex-col items-center mt-6">
    <h3 class="text-white text-lg font-medium mb-3">Vali statistika:</h3>

    <div class="flex flex-wrap justify-center gap-2">
        {#each statOptions as stat}
            <button
                    class="px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 border-2 border-[#03538b] text-white
					hover:bg-[#03538b] hover:scale-105
					{selectedStat === stat ? 'bg-gradient-to-br from-[#03538b] to-[#0478c0] shadow-[0_0_12px_rgba(3,83,139,0.6)] scale-110' : 'bg-[#001a4d]'}"
                    on:click={() => handleSelect(stat)}>
                {stat}
            </button>
        {/each}
    </div>
</div>
