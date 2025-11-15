<script lang="ts">
    import { onMount } from "svelte";
    import { getTeamSeasonStats } from "../lib/services/statsService";

    export let seasonName: string;
    let loading = true;
    let teamStats: Record<string, any> = {};

    onMount(loadStats);
    $: if (seasonName) {
        loadStats();
    }

    async function loadStats() {
        loading = true;
        if (!seasonName) {
            return;
        }
        teamStats = await getTeamSeasonStats(seasonName);
        loading = false;
    }
</script>

<div class="bg-[#03538b]/10 border border-[#03538b]/30 rounded-2xl p-4 md:p-6 w-full shadow-md">
    <h3 class="text-base md:text-lg font-semibold text-[#00b0ff] mb-4 text-center flex items-center justify-center gap-2">
        📊 Tiimide hooaja keskmised
    </h3>

    {#if loading}
        <p class="text-center text-sm text-gray-400">⏳ Laen tiimide andmeid...</p>
    {:else if Object.keys(teamStats).length === 0}
        <p class="text-center text-sm text-gray-400">Andmeid ei leitud selle hooaja kohta.</p>
    {:else}
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            {#each Object.entries(teamStats) as [teamName, s]}
                <div class="bg-[#03538b]/20 border border-[#03538b]/40 rounded-xl p-3 md:p-4 flex flex-col text-center shadow-sm">
                    <h4 class="text-sm font-semibold text-[#8fd6ff] mb-2">{teamName}</h4>
                    <div class="grid grid-cols-3 gap-x-3 gap-y-2 text-[11px] md:text-xs text-gray-200">
                        <div>PTS: {s.PTS}</div>
                        <div>REB: {s.REB}</div>
                        <div>AST: {s.AST}</div>
                        <div>STL: {s.STL}</div>
                        <div>BLK: {s.BLK}</div>
                        <div>FG%: {s.FG_PCT}</div>
                        <div>3PT%: {s.TP_PCT}</div>
                        <div>FT%: {s.FT_PCT}</div>
                        <div class="col-span-3 text-[#00b0ff] font-semibold mt-1">DIFF: {(s.PTS - s.OPP_PTS) || 0}</div>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>
