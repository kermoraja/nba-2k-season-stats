<script lang="ts">
    import { onMount } from 'svelte'
    import { getAvailableSeasons, getSeasonStats, type PlayerStats } from '../../lib/services/statsService'

    let seasons: string[] = []
    let selectedSeason = ''
    let selectedTeam = ''
    let teams: string[] = []
    let players: PlayerStats[] = []
    let isLoading = false
    let showBothTeams = false

    const columns: { key: keyof PlayerStats; label: string }[] = [
        { key: 'NAME', label: 'NAME' },
        { key: 'GAMES', label: 'GAMES' },
        { key: 'PTS', label: 'PTS' },
        { key: 'REB', label: 'REB' },
        { key: 'AST', label: 'AST' },
        { key: 'STL', label: 'STL' },
        { key: 'BLK', label: 'BLK' },
        { key: 'TO', label: 'TO' },
        { key: 'MIN', label: 'MIN' },
        { key: 'FG_PCT', label: 'FG%' },
        { key: 'FT_PCT', label: 'FT%' },
        { key: 'TP_PCT', label: '3PT%' }
    ]

    let sortKey: keyof PlayerStats | null = null
    let sortAsc = true

    onMount(async () => {
        isLoading = true
        seasons = await getAvailableSeasons()
        if (seasons.length > 0) {
            selectedSeason = seasons[(seasons.length -1)]
            await loadSeasonStats()
        }
        isLoading = false
    })

    async function loadSeasonStats() {
        isLoading = true
        const { teams: teamStats } = await getSeasonStats(selectedSeason)
        teams = Object.keys(teamStats)
        if (!selectedTeam && teams.length > 0) selectedTeam = teams[0]

        if (showBothTeams) {
            players = teams.flatMap(team =>
                teamStats[team].map(p => ({ ...p, TEAM: team }))
            )
        } else {
            players = selectedTeam ? teamStats[selectedTeam].map(p => ({ ...p, TEAM: selectedTeam })) : []
        }

        applySort()
        isLoading = false
    }

    function handleSeasonChange(e: Event) {
        selectedSeason = (e.target as HTMLSelectElement).value
        loadSeasonStats()
    }

    function handleTeamChange(e: Event) {
        selectedTeam = (e.target as HTMLSelectElement).value
        loadSeasonStats()
    }

    function handleBothTeamsToggle(e: Event) {
        showBothTeams = (e.target as HTMLInputElement).checked
        loadSeasonStats()
    }

    function sortBy(key: keyof PlayerStats) {
        if (sortKey === key) {
            sortAsc = !sortAsc
        } else {
            sortKey = key
            sortAsc = true
        }
        applySort()
    }

    function normalize(v: unknown): number | string {
        if (v === null || v === undefined) return -Infinity
        if (typeof v === 'number') return v
        const n = parseFloat(String(v))
        return isNaN(n) ? String(v).toLowerCase() : n
    }

    function applySort() {
        if (!sortKey) return
        const key = sortKey
        players = [...players].sort((a, b) => {
            const av = normalize(a[key])
            const bv = normalize(b[key])
            if (av < bv) return sortAsc ? -1 : 1
            if (av > bv) return sortAsc ? 1 : -1
            return 0
        })
    }

    function fmtPct(v: number | string | undefined) {
        if (v === undefined || v === null || v === '') return ''
        const n = typeof v === 'number' ? v : parseFloat(String(v))
        return isNaN(n) ? String(v) : `${n}%`
    }
</script>

<div class="p-6 space-y-4 text-white">
    <h1 class="text-3xl font-bold">Kogu statistika</h1>

    <div class="flex flex-wrap gap-4 items-center">
        <select class="bg-[#03538b] px-3 py-2 rounded-lg" bind:value={selectedSeason} on:change={handleSeasonChange}>
            {#each seasons as season}
                <option value={season}>{season}</option>
            {/each}
        </select>

        <select class="bg-[#03538b] px-3 py-2 rounded-lg" bind:value={selectedTeam} on:change={handleTeamChange} disabled={showBothTeams}>
            {#each teams as team}
                <option value={team}>{team}</option>
            {/each}
        </select>

        <label class="flex items-center space-x-2">
            <input type="checkbox" bind:checked={showBothTeams} on:change={handleBothTeamsToggle}>
            <span>Näita mõlemat tiimi</span>
        </label>
    </div>

    {#if isLoading}
        <p>Laen andmeid...</p>
    {:else}
        <div class="overflow-x-auto">
            <table class="min-w-full border border-gray-700 rounded-xl">
                <thead class="bg-[#03538b]">
                <tr>
                    <th class="px-3 py-2">TEAM</th>
                    {#each columns as col}
                        <th
                                class="px-3 py-2 cursor-pointer text-left select-none"
                                on:click={() => sortBy(col.key)}
                        >
                            {col.label}
                            {#if sortKey === col.key}
                                <span>{sortAsc ? '↑' : '↓'}</span>
                            {/if}
                        </th>
                    {/each}
                </tr>
                </thead>
                <tbody>
                {#each players as p}
                    <tr class="odd:bg-[#001233] even:bg-[#002b5c] hover:bg-[#023e7d]">
                        <td class="px-3 py-2 font-bold">{p.TEAM}</td>
                        <td class="px-3 py-2 font-semibold">
                            <a href={"#/player/" + p.NAME.replace(/\./g, "-").replace(/\s+/g, "")}>
                                {p.NAME}
                            </a>
                        </td>
                        <td class="px-3 py-2">{p.GAMES}</td>
                        <td class="px-3 py-2">{p.PTS}</td>
                        <td class="px-3 py-2">{p.REB}</td>
                        <td class="px-3 py-2">{p.AST}</td>
                        <td class="px-3 py-2">{p.STL}</td>
                        <td class="px-3 py-2">{p.BLK}</td>
                        <td class="px-3 py-2">{p.TO}</td>
                        <td class="px-3 py-2">{p.MIN}</td>
                        <td class="px-3 py-2">{fmtPct(p.FG_PCT)}</td>
                        <td class="px-3 py-2">{fmtPct(p.FT_PCT)}</td>
                        <td class="px-3 py-2">{fmtPct(p.TP_PCT)}</td>
                    </tr>
                {/each}
                </tbody>
            </table>
        </div>
    {/if}
</div>

<style>
    select {
        color: white;
    }
</style>
