<script lang="ts">
    import { onMount } from 'svelte'
    import { getSeasonStats, getAllSeasons } from '../../lib/services/statsService'
    import { getImageUrl } from '../../lib/utils/images'

    let seasons: string[] = []
    let selectedSeason = ''
    let players: any[] = []
    let teamA: any[] = []
    let teamB: any[] = []
    let selectedA: any = null
    let selectedB: any = null
    const stats = ['GAMES','PTS','REB','AST','STL','BLK','TO','MIN','FG_PCT','FT_PCT','TP_PCT']

    onMount(async () => {
        seasons = await getAllSeasons()
        if (seasons.length === 0) return
        selectedSeason = seasons[0]
        await loadSeason(selectedSeason)
    })

    async function loadSeason(season: string) {
        const { players: seasonPlayers } = await getSeasonStats(season)
        players = seasonPlayers || []
        teamA = players.filter(p => p.TEAM === 'HAWKS')
        teamB = players.filter(p => p.TEAM === 'JAZZ')
        selectedA = null
        selectedB = null
    }

    function selectPlayer(player, side: 'A' | 'B') {
        if (side === 'A') selectedA = player
        else selectedB = player
    }

    function formatValue(v, stat) {
        if (v === null || v === undefined || v === '') return '-'
        if (stat.endsWith('_PCT')) return `${v}%`
        return v
    }

    function getHighlightClass(a, b, stat, side) {
        if (typeof a !== 'number' || typeof b !== 'number') return ''
        if (a === b) return ''
        const better = stat === 'TO' ? a < b : a > b
        return (side === 'A' && better) || (side === 'B' && !better)
            ? 'text-green-400 font-semibold'
            : 'text-red-400'
    }
</script>

<div class="min-h-screen bg-[#000536] text-white p-8 space-y-10">
    <div class="flex flex-col items-center gap-4">
        <h1 class="text-4xl font-bold text-center">Team Player Comparison</h1>

        {#if seasons.length > 0}
            <div class="flex items-center gap-3">
                <label class="opacity-80 text-sm">Hooaeg:</label>
                <select
                        bind:value={selectedSeason}
                        on:change={() => loadSeason(selectedSeason)}
                        class="px-2 py-1 bg-[#03538b] rounded-lg text-white border border-[#046ab8]"
                >
                    {#each seasons as s}
                        <option value={s}>{s}</option>
                    {/each}
                </select>
            </div>
        {:else}
            <p class="text-gray-400 mt-2">Hooajad puuduvad.</p>
        {/if}
    </div>

    {#if players.length > 0}
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- LEFT TEAM -->
            <div class="space-y-3">
                <h2 class="text-center text-2xl text-[#05b5ff] font-bold mb-3">{teamA[0]?.TEAM}</h2>
                <div class="flex flex-wrap justify-center gap-3">
                    {#each teamA as p}
                        <div
                                class={`cursor-pointer text-center transition w-20 ${
                                selectedA?.NAME === p.NAME ? 'scale-105' : 'hover:scale-105'
                            }`}
                                on:click={() => selectPlayer(p, 'A')}
                        >
                            <img
                                    src={getImageUrl(p.NAME)}
                                    alt={p.NAME}
                                    class={`w-16 h-16 rounded-full object-cover mx-auto border-2 transition-all duration-200 ${
                                    selectedA?.NAME === p.NAME
                                        ? 'border-[#05b5ff] ring-4 ring-[#05b5ff]/40 shadow-lg shadow-[#05b5ff]/30'
                                        : 'border-[#03538b]'
                                }`}
                            />
                            <p
                                    class={`text-xs mt-1 truncate w-full ${
                                    selectedA?.NAME === p.NAME ? 'text-[#05b5ff] font-semibold' : ''
                                }`}
                            >
                                {p.NAME}
                            </p>
                        </div>
                    {/each}
                </div>
            </div>

            <!-- RIGHT TEAM -->
            <div class="space-y-3">
                <h2 class="text-center text-2xl text-[#05b5ff] font-bold mb-3">{teamB[0]?.TEAM}</h2>
                <div class="flex flex-wrap justify-center gap-3">
                    {#each teamB as p}
                        <div
                                class={`cursor-pointer text-center transition w-20 ${
                                selectedB?.NAME === p.NAME ? 'scale-105' : 'hover:scale-105'
                            }`}
                                on:click={() => selectPlayer(p, 'B')}
                        >
                            <img
                                    src={getImageUrl(p.NAME)}
                                    alt={p.NAME}
                                    class={`w-16 h-16 rounded-full object-cover mx-auto border-2 transition-all duration-200 ${
                                    selectedB?.NAME === p.NAME
                                        ? 'border-[#05b5ff] ring-4 ring-[#05b5ff]/40 shadow-lg shadow-[#05b5ff]/30'
                                        : 'border-[#03538b]'
                                }`}
                            />
                            <p
                                    class={`text-xs mt-1 truncate w-full ${
                                    selectedB?.NAME === p.NAME ? 'text-[#05b5ff] font-semibold' : ''
                                }`}
                            >
                                {p.NAME}
                            </p>
                        </div>
                    {/each}
                </div>
            </div>
        </div>

        <!-- Comparison Table -->
        {#if selectedA && selectedB}
            <div class="flex flex-col md:flex-row items-center justify-center gap-10 mt-10">
                <div class="flex flex-col items-center text-center space-y-3">
                    <img src={getImageUrl(selectedA.NAME)} class="w-28 h-28 rounded-full border-4 border-[#03538b]" />
                    <h2 class="text-xl font-bold">{selectedA.NAME}</h2>
                </div>

                <div class="flex flex-col items-center justify-center text-[#03538b]">
                    <div class="text-4xl font-extrabold">VS</div>
                    <div class="mt-2 w-10 h-1 bg-gradient-to-r from-[#03538b] to-[#05b5ff] rounded-full"></div>
                </div>

                <div class="flex flex-col items-center text-center space-y-3">
                    <img src={getImageUrl(selectedB.NAME)} class="w-28 h-28 rounded-full border-4 border-[#03538b]" />
                    <h2 class="text-xl font-bold">{selectedB.NAME}</h2>
                </div>
            </div>

            <div class="overflow-x-auto mt-8">
                <table class="min-w-full border border-gray-700 rounded-xl text-center">
                    <thead class="bg-[#03538b]">
                    <tr>
                        <th class="py-2 px-3 text-left">Stat</th>
                        <th class="py-2 px-3">{selectedA.NAME}</th>
                        <th class="py-2 px-3">{selectedB.NAME}</th>
                    </tr>
                    </thead>
                    <tbody>
                    {#each stats as stat}
                        <tr class="odd:bg-[#001233] even:bg-[#002b5c]">
                            <td class="py-2 px-3 text-left font-semibold">{stat}</td>
                            <td class={`py-2 px-3 ${getHighlightClass(selectedA[stat], selectedB[stat], stat, 'A')}`}>
                                {formatValue(selectedA[stat], stat)}
                            </td>
                            <td class={`py-2 px-3 ${getHighlightClass(selectedA[stat], selectedB[stat], stat, 'B')}`}>
                                {formatValue(selectedB[stat], stat)}
                            </td>
                        </tr>
                    {/each}
                    </tbody>
                </table>
            </div>
        {:else}
            <p class="text-center mt-6 opacity-70">Select one player from each team to compare</p>
        {/if}
    {:else}
        <p class="text-center opacity-70 mt-6">Andmed puuduvad valitud hooajal.</p>
    {/if}
</div>
