<script>
    export let show = false;
    export let editStats = {};
    export let onCancel;
    export let onSave;
</script>

{#if show}
    <div class="fixed inset-0 bg-black/60 flex items-center justify-center p-4">
        <div class="bg-[#00154f] border border-[#03538b] rounded-xl p-6 w-full max-w-md relative">

            <button class="absolute top-2 right-2" on:click={onCancel}>✕</button>

            <h2 class="text-xl text-[#03a9f4] mb-2">Muuda mängu</h2>

            <div class="grid grid-cols-2 gap-3">
                {#each Object.keys(editStats) as key}
                    <div>
                        <label class="text-xs opacity-70">{key}</label>
                        <input bind:value={editStats[key]} class="w-full bg-[#002366] rounded px-2 py-1"/>
                    </div>
                {/each}
            </div>

            <div class="flex justify-end mt-4 gap-3">
                <button class="px-3 py-1 bg-gray-600 rounded" on:click={onCancel}>Loobu</button>
                <button class="px-3 py-1 bg-[#03538b] rounded" on:click={onSave}>Salvesta</button>
            </div>
        </div>
    </div>
{/if}
