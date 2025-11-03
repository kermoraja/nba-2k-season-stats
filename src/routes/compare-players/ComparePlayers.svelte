<script lang="ts">
    import { onMount } from 'svelte'
    import { getAvailableSeasons, getSeasonStats, type PlayerStats } from '../../lib/services/statsService'
    import { getImageUrl } from '../../lib/utils/images'

    let seasons: string[] = []
    let selectedSeason = ''
    let players: PlayerStats[] = []
    let playerOptions: string[] = []
    let playerA: PlayerStats | null = null
    let playerB: PlayerStats | null = null
    let isLoading = false

    const stats = ['GAMES','PTS','REB','AST','STL','BLK','TO','MIN','FG_PCT','FT_PCT','TP_PCT']

    onMount(async () => {
        isLoading = true
        seasons = await getAvailableSeasons()
        if (seasons.length > 0) {
            selectedSeason = seasons[0]
            await loadSeason()
        }
        isLoading = false
    })

    async function loadSeason() {
        isLoading = true
        const { players: seasonPlayers } = await getSeasonStats(selectedSeason)
        players = seasonPlayers
        playerOptions = players.map((p) => p.NAME)
        playerA = null
        playerB = null
        isLoading = false
    }

    function handleSeasonChange(e: Event) {
        selectedSeason = (e.target as HTMLSelectElement).value
        loadSeason()
    }

    function selectPlayer(e: Event, side: 'A' | 'B') {
        const name = (e.target as HTMLSelectElement).value
        const p = players.find((x) => x.NAME === name)
        if (side === 'A') playerA = p || null
        if (side === 'B') playerB = p || null
    }

    function formatValue(v: unknown, stat: string) {
        if (v === null || v === undefined || v === '') return '-'
        if (stat.endsWith('_PCT')) return `${v}%`
        return v
    }

    function getHighlightClass(a: number | string, b: number | string, stat: string, side: 'A' | 'B') {
        if (typeof a !== 'number' || typeof b !== 'number') return ''
        if (a === b) return ''
        const better = stat === 'TO' ? a < b : a > b
        return (side === 'A' && better) || (side === 'B' && !better)
            ? 'text-green-400 font-semibold'
            : 'text-red-400'
    }
</script>

<div class="min-h-screen bg-[#000536] text-white p-8 space-y-10">
    <h1 class="text-4xl font-bold text-center">Player Comparison</h1>

    <div class="flex flex-wrap justify-center gap-4">
        <select class="bg-[#03538b] px-4 py-2 rounded-lg" bind:value={selectedSeason} on:change={handleSeasonChange}>
            {#each seasons as season}
                <option value={season}>{season}</option>
            {/each}
        </select>

        <select class="bg-[#03538b] px-4 py-2 rounded-lg" on:change={(e) => selectPlayer(e, 'A')}>
            <option value="">Select Player A</option>
            {#each playerOptions as name}
                <option value={name}>{name}</option>
            {/each}
        </select>

        <select class="bg-[#03538b] px-4 py-2 rounded-lg" on:change={(e) => selectPlayer(e, 'B')}>
            <option value="">Select Player B</option>
            {#each playerOptions as name}
                <option value={name}>{name}</option>
            {/each}
        </select>
    </div>

    {#if isLoading}
        <p class="text-center">Loading...</p>
    {:else if playerA && playerB}
        <div class="flex flex-col md:flex-row items-center justify-center gap-10 mt-8">
            <div class="flex flex-col items-center text-center space-y-3">
                <img
                        src={getImageUrl(playerA.NAME)}
                        alt={playerA.NAME}
                        class="w-32 h-32 rounded-full object-cover border-4 border-[#03538b]"
                />
                <h2 class="text-2xl font-bold">{playerA.NAME}</h2>
                <p class="text-[#05b5ff] text-sm">{playerA.TEAM}</p>
            </div>

            <div class="flex flex-col items-center justify-center text-[#03538b]">
                <div class="text-5xl font-extrabold drop-shadow-lg select-none">VS</div>
                <div class="mt-2 w-12 h-1 bg-gradient-to-r from-[#03538b] to-[#05b5ff] rounded-full"></div>
            </div>

            <div class="flex flex-col items-center text-center space-y-3">
                <img
                        src={getImageUrl(playerB.NAME)}
                        alt={playerB.NAME}
                        class="w-32 h-32 rounded-full object-cover border-4 border-[#03538b]"
                />
                <h2 class="text-2xl font-bold">{playerB.NAME}</h2>
                <p class="text-[#05b5ff] text-sm">{playerB.TEAM}</p>
            </div>
        </div>

        <div class="overflow-x-auto mt-10">
            <table class="min-w-full border border-gray-700 rounded-xl text-center">
                <thead class="bg-[#03538b]">
                <tr>
                    <th class="py-2 px-3 text-left">Stat</th>
                    <th class="py-2 px-3">{playerA.NAME}</th>
                    <th class="py-2 px-3">{playerB.NAME}</th>
                </tr>
                </thead>
                <tbody>
                {#each stats as stat}
                    <tr class="odd:bg-[#001233] even:bg-[#002b5c]">
                        <td class="py-2 px-3 text-left font-semibold">{stat}</td>
                        <td
                                class={`py-2 px-3 ${getHighlightClass(playerA[stat], playerB[stat], stat, 'A')}`}
                        >
                            {formatValue(playerA[stat], stat)}
                        </td>
                        <td
                                class={`py-2 px-3 ${getHighlightClass(playerA[stat], playerB[stat], stat, 'B')}`}
                        >
                            {formatValue(playerB[stat], stat)}
                        </td>
                    </tr>
                {/each}
                </tbody>
            </table>
        </div>
    {:else}
        <p class="text-center opacity-70">Choose two players to compare</p>
    {/if}
</div>
