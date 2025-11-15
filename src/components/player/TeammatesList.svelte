<script>
    import { link } from "svelte-spa-router";
    import { getImageUrl } from "../../lib/utils/images";

    export let teammates = [];
</script>

{#if teammates.length > 0}
    <h2 class="text-lg font-semibold text-[#03a9f4] mb-2">Sama tiimi mängijad</h2>
    <div class="flex flex-wrap gap-4 mb-10">
        {#each teammates as t}
            <a use:link href={"/player/" + t.name.replace(/ /g, "-").replace(/\./g, "~")}
               class="flex flex-col items-center w-20 hover:scale-105 transition">
                <img src={getImageUrl(t.name)} class="w-16 h-16 rounded-full border-2 border-[#03538b] object-cover"/>
                <span class="text-xs mt-1">{t.name}</span>
            </a>
        {/each}
    </div>
{/if}
