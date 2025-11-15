<script>
    export let averages = {};
</script>

<div class="bg-[#001048] p-6 rounded-2xl mb-6 shadow-lg">
    <h2 class="text-xl font-semibold text-[#03a9f4] mb-4">🏀 Hooaja keskmised</h2>
    <div class="grid grid-cols-3 md:grid-cols-6 gap-4 text-center">
        {#each Object.entries(averages) as [key, val]}
            <div class="bg-[#022c56] p-3 rounded-xl">
                <div class="text-lg font-bold text-[#03a9f4]">{val.toFixed(1)}</div>
                <div class="text-xs opacity-60">{key}</div>
            </div>
        {/each}
    </div>
</div>
