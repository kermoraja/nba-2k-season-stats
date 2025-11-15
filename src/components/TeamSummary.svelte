<script lang="ts">
    import { onMount } from "svelte";
    import { getTeamSeasonStats } from "../lib/services/statsService";

    export let seasonName: string;
    let loading = true;
    let teamStats: Record<string, any> = {};

    onMount(() => {
        if (seasonName) {
            loadStats();
        }
    });

    $: if (seasonName) {
        loadStats();
    }

    async function loadStats() {
        loading = true;
        try {
            if (!seasonName) {
                teamStats = {};
                loading = false;
                return;
            }
            const result = await getTeamSeasonStats(seasonName);
            teamStats = result || {};
        } catch (err) {
            console.error("Viga tiimide statistika laadimisel:", err);
            teamStats = {};
        } finally {
            loading = false;
        }
    }

    function formatNum(val) {
        return (val && !isNaN(val)) ? Number(val).toFixed(1) : "-";
    }

    function formatDiff(diff) {
        const d = Number(diff) || 0;
        return d > 0 ? `+${d.toFixed(1)}` : d.toFixed(1);
    }
</script>

<div class="bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-slate-700/50 rounded-2xl p-6 md:p-8 w-full shadow-2xl backdrop-blur-md">
    <div class="flex items-center gap-3 mb-6">
        <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg">
            <span class="text-xl">📊</span>
        </div>
        <h3 class="text-xl md:text-2xl font-bold text-white tracking-tight">
            Tiimide hooaja keskmised
        </h3>
    </div>

    {#if loading}
        <div class="flex flex-col items-center justify-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-4 border-slate-600 border-t-blue-500 mb-4"></div>
            <p class="text-slate-400 text-sm">Laen tiimide andmeid...</p>
        </div>
    {:else if Object.keys(teamStats).length === 0}
        <div class="text-center py-12">
            <div class="text-5xl mb-4 opacity-50">📭</div>
            <p class="text-slate-400">Andmeid ei leitud selle hooaja kohta.</p>
        </div>
    {:else}
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {#each Object.entries(teamStats) as [teamName, s]}
                <div class="group relative bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700/50 rounded-xl p-6 shadow-lg hover:shadow-2xl hover:border-slate-600/70 transition-all duration-300 hover:-translate-y-1">
                    <!-- Team Header -->
                    <div class="mb-5 pb-4 border-b border-slate-700/50">
                        <h4 class="text-lg font-bold text-white tracking-wide">{teamName}</h4>
                    </div>

                    <!-- Stats Grid -->
                    <div class="space-y-3 mb-4">
                        <!-- Scoring Stats -->
                        <div class="grid grid-cols-3 gap-2">
                            <div class="bg-slate-900/50 rounded-lg p-2.5 text-center border border-slate-700/30">
                                <div class="text-[9px] text-slate-400 uppercase tracking-wider mb-0.5">PTS</div>
                                <div class="text-sm font-bold text-white">{formatNum(s.PTS)}</div>
                            </div>
                            <div class="bg-slate-900/50 rounded-lg p-2.5 text-center border border-slate-700/30">
                                <div class="text-[9px] text-slate-400 uppercase tracking-wider mb-0.5">REB</div>
                                <div class="text-sm font-bold text-white">{formatNum(s.REB)}</div>
                            </div>
                            <div class="bg-slate-900/50 rounded-lg p-2.5 text-center border border-slate-700/30">
                                <div class="text-[9px] text-slate-400 uppercase tracking-wider mb-0.5">AST</div>
                                <div class="text-sm font-bold text-white">{formatNum(s.AST)}</div>
                            </div>
                        </div>

                        <!-- Defense Stats -->
                        <div class="grid grid-cols-2 gap-2">
                            <div class="bg-slate-900/50 rounded-lg p-2.5 text-center border border-slate-700/30">
                                <div class="text-[9px] text-slate-400 uppercase tracking-wider mb-0.5">STL</div>
                                <div class="text-sm font-bold text-white">{formatNum(s.STL)}</div>
                            </div>
                            <div class="bg-slate-900/50 rounded-lg p-2.5 text-center border border-slate-700/30">
                                <div class="text-[9px] text-slate-400 uppercase tracking-wider mb-0.5">BLK</div>
                                <div class="text-sm font-bold text-white">{formatNum(s.BLK)}</div>
                            </div>
                        </div>

                        <!-- Shooting Percentages -->
                        <div class="grid grid-cols-3 gap-2">
                            <div class="bg-slate-900/50 rounded-lg p-2.5 text-center border border-slate-700/30">
                                <div class="text-[9px] text-slate-400 uppercase tracking-wider mb-0.5">FG%</div>
                                <div class="text-sm font-bold text-cyan-400">{formatNum(s.FG_PCT)}</div>
                            </div>
                            <div class="bg-slate-900/50 rounded-lg p-2.5 text-center border border-slate-700/30">
                                <div class="text-[9px] text-slate-400 uppercase tracking-wider mb-0.5">3PT%</div>
                                <div class="text-sm font-bold text-cyan-400">{formatNum(s.TP_PCT)}</div>
                            </div>
                            <div class="bg-slate-900/50 rounded-lg p-2.5 text-center border border-slate-700/30">
                                <div class="text-[9px] text-slate-400 uppercase tracking-wider mb-0.5">FT%</div>
                                <div class="text-sm font-bold text-cyan-400">{formatNum(s.FT_PCT)}</div>
                            </div>
                        </div>
                    </div>

                    <!-- Point Differential -->
                    <div class="mt-4 pt-4 border-t border-slate-700/50">
                        <div class="flex items-center justify-between">
                            <span class="text-xs text-slate-400 uppercase tracking-wider">Punktide vahe</span>
                            <div
                                    class="px-4 py-2 rounded-lg font-bold text-sm shadow-md"
                                    class:bg-gradient-to-r={s.PTS - s.OPP_PTS > 0}
                                    class:from-green-600={s.PTS - s.OPP_PTS > 0}
                                    class:to-emerald-600={s.PTS - s.OPP_PTS > 0}
                                    class:text-white={s.PTS - s.OPP_PTS > 0}
                                    class:from-red-600={s.PTS - s.OPP_PTS <= 0}
                                    class:to-rose-600={s.PTS - s.OPP_PTS <= 0}
                            >
                                {formatDiff(s.PTS - s.OPP_PTS)}
                            </div>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>