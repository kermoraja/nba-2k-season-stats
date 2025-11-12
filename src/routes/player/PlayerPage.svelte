<script lang="ts">
    import { onMount } from "svelte";
    import { params } from "svelte-spa-router";
    import { collection, getDocs, getDoc, updateDoc, doc } from "firebase/firestore";
    import { user } from "../../lib/stores/userStore";
    import { db } from "../../lib/firebase";
    import { getImageUrl } from "../../lib/utils/images";

    let playerName = "";
    let allSeasons: string[] = [];
    let selectedSeason = "";
    let games: any[] = [];
    let averages: Record<string, number> = {};
    let loading = true;
    let playerImageUrl = "";
    let playedSeasons: string[] = [];
    let playerGames: any[] = [];

    let showEditModal = false;
    let selectedGame: any = null;
    let editStats: Record<string, number | string> = {};

    let playerOverall: number | null = null;
    let editingOverall = false;
    let newOverall: number | null = null;

    let seasonAverages: Record<string, Record<string, number>> = {};
    let seasonGameCounts: Record<string, number> = {}; // GP veeru jaoks

    $: rawParam = $params?.name ?? "";
    $: playerName = rawParam.replace(/-/g, " ").replace(/~/g, ".");

    function openEditModal(game: any) {
        if (!$user) {
            return;
        }
        selectedGame = game;
        editStats = {
            PTS: game.PTS,
            REB: game.REB,
            AST: game.AST,
            STL: game.STL,
            BLK: game.BLK,
            TO: game.TO,
            FLS: game.FLS,
            FG: game.FG || "",
            "3PT": game["3PT"] || "",
            FT: game.FT || ""
        };
        showEditModal = true;
    }

    async function saveStats() {
        if (!selectedGame?.ref) {
            alert("Mängu dokumenti ei leitud.");
            return;
        }

        try {
            const path = selectedGame.IS_HOME
                ? "HOME_TEAM_PLAYER_STATS"
                : "AWAY_TEAM_PLAYER_STATS";

            const snapshot = await getDoc(selectedGame.ref);
            const data = snapshot.data();
            if (!data) return alert("Andmeid ei leitud.");

            const arr = data[path];
            const playerIndex = arr.findIndex((p: any) => p.NAME === playerName);
            if (playerIndex === -1) return alert("Mängijat ei leitud selles mängus.");

            Object.entries(editStats).forEach(([key, val]) => {
                arr[playerIndex][key] = val;
            });

            await updateDoc(selectedGame.ref, { [path]: arr });
            alert("Statistika edukalt uuendatud!");
            Object.assign(selectedGame, editStats);
            showEditModal = false;
        } catch (err) {
            console.error(err);
            alert("Viga andmete uuendamisel.");
        }
    }

    async function saveOverall() {
        try {
            if (!newOverall || isNaN(newOverall)) {
                alert("Palun sisesta korrektne number.");
                return;
            }
            const playerId = rawParam.toLowerCase().replace(/~/g, ".");
            const playerRef = doc(db, "players", playerId);
            await updateDoc(playerRef, { overall: Number(newOverall) });
            playerOverall = Number(newOverall);
            editingOverall = false;
            alert("Reiting uuendatud!");
        } catch (err) {
            console.error(err);
            alert("Viga reitingu uuendamisel.");
        }
    }

    onMount(async () => {
        loading = true;
        const snapshot = await getDocs(collection(db, "games"));

        const seasonsSet = new Set<string>();

        snapshot.forEach((doc) => {
            const data = doc.data();
            seasonsSet.add(data.SEASON);

            const homeArr = data.HOME_TEAM_PLAYER_STATS || [];
            const awayArr = data.AWAY_TEAM_PLAYER_STATS || [];

            const inHome = homeArr.some((p) => p.NAME === playerName);
            const inAway = awayArr.some((p) => p.NAME === playerName);

            if (!inHome && !inAway) {
                return;
            }

            const stat = (inHome ? homeArr : awayArr).find((p) => p.NAME === playerName);
            const isHome = inHome;
            const team = isHome ? data.HOME_TEAM : data.AWAY_TEAM;
            const opponent = isHome ? data.AWAY_TEAM : data.HOME_TEAM;
            const locMarker = isHome ? "vs" : "@";

            const awayScore = data.GAME_SUMMARY?.AWAY_TEAM_TOTAL || 0;
            const homeScore = data.GAME_SUMMARY?.HOME_TEAM_TOTAL || 0;

            playerGames.push({
                id: doc.id,
                ref: doc.ref,
                SEASON: data.SEASON,
                GAME_DATE: data.GAME_DATE,
                TEAM: team,
                OPPONENT: opponent,
                IS_HOME: isHome,
                VS_LABEL: `${locMarker} ${opponent}`,
                SCORE_DETAIL: isHome
                    ? `${team} ${homeScore} - ${awayScore} ${opponent}`
                    : `${team} ${awayScore} - ${homeScore} ${opponent}`,
                RESULT: isHome
                    ? homeScore > awayScore ? "W" : "L"
                    : awayScore > homeScore ? "W" : "L",
                ...stat,
            });
        });

        playerGames.sort((a, b) => new Date(a.GAME_DATE).getTime() - new Date(b.GAME_DATE).getTime());

        allSeasons = Array.from(seasonsSet);
        playedSeasons = allSeasons.filter(season =>
            playerGames.some(game => game.SEASON === season)
        );

        // Sorteeri ja vali automaatselt uusim hooaeg
        playedSeasons.sort((a, b) => a.localeCompare(b));
        const latestSeason = playedSeasons[playedSeasons.length - 1];
        selectedSeason = latestSeason;

        games = playerGames.filter(g => g.SEASON === selectedSeason);

        if (games.length > 0) {
            calculateAverages();
        }

        calculateSeasonAverages();

        playerImageUrl = getImageUrl(playerName);

        const playerId = rawParam.toLowerCase().replace(/~/g, ".");
        const playerRef = doc(db, "players", playerId);
        const playerSnap = await getDoc(playerRef);
        if (playerSnap.exists()) {
            playerOverall = playerSnap.data().overall ?? null;
            newOverall = playerOverall;
        }

        loading = false;
    });

    function calculateAverages() {
        const sum: Record<string, number> = {
            PTS: 0, REB: 0, AST: 0, STL: 0, BLK: 0, TO: 0, FLS: 0,
        };

        const totals = {
            FG_Made: 0,
            FG_Att: 0,
            TP_Made: 0,
            TP_Att: 0,
            FT_Made: 0,
            FT_Att: 0,
        };

        games.forEach((g) => {
            for (const key in sum) {
                sum[key] += Number(g[key] || 0);
            }

            if (g.FG) {
                const [m, a] = g.FG.split("-").map(Number);
                totals.FG_Made += m || 0;
                totals.FG_Att += a || 0;
            }
            if (g["3PT"]) {
                const [m, a] = g["3PT"].split("-").map(Number);
                totals.TP_Made += m || 0;
                totals.TP_Att += a || 0;
            }
            if (g.FT) {
                const [m, a] = g.FT.split("-").map(Number);
                totals.FT_Made += m || 0;
                totals.FT_Att += a || 0;
            }
        });

        const totalGames = games.length || 1;

        for (const key in sum) {
            averages[key] = parseFloat((sum[key] / totalGames).toFixed(1));
        }

        averages["FG%"] = totals.FG_Att > 0 ? parseFloat(((totals.FG_Made / totals.FG_Att) * 100).toFixed(1)) : 0;
        averages["3PT%"] = totals.TP_Att > 0 ? parseFloat(((totals.TP_Made / totals.TP_Att) * 100).toFixed(1)) : 0;
        averages["FT%"] = totals.FT_Att > 0 ? parseFloat(((totals.FT_Made / totals.FT_Att) * 100).toFixed(1)) : 0;
    }

    function calculateSeasonAverages() {
        seasonAverages = {};
        seasonGameCounts = {};
        for (const season of playedSeasons) {
            const seasonGames = playerGames.filter(g => g.SEASON === season);
            if (seasonGames.length === 0) continue;

            seasonGameCounts[season] = seasonGames.length;

            const sum: Record<string, number> = {
                PTS: 0, REB: 0, AST: 0, STL: 0, BLK: 0, TO: 0, FLS: 0,
            };
            const totals = {
                FG_Made: 0,
                FG_Att: 0,
                TP_Made: 0,
                TP_Att: 0,
                FT_Made: 0,
                FT_Att: 0,
            };

            seasonGames.forEach((g) => {
                for (const key in sum) {
                    sum[key] += Number(g[key] || 0);
                }
                if (g.FG) {
                    const [m, a] = g.FG.split("-").map(Number);
                    totals.FG_Made += m || 0;
                    totals.FG_Att += a || 0;
                }
                if (g["3PT"]) {
                    const [m, a] = g["3PT"].split("-").map(Number);
                    totals.TP_Made += m || 0;
                    totals.TP_Att += a || 0;
                }
                if (g.FT) {
                    const [m, a] = g.FT.split("-").map(Number);
                    totals.FT_Made += m || 0;
                    totals.FT_Att += a || 0;
                }
            });

            const totalGames = seasonGames.length;
            const avg: Record<string, number> = {};
            for (const key in sum) {
                avg[key] = parseFloat((sum[key] / totalGames).toFixed(1));
            }
            avg["FG%"] = totals.FG_Att > 0 ? parseFloat(((totals.FG_Made / totals.FG_Att) * 100).toFixed(1)) : 0;
            avg["3PT%"] = totals.TP_Att > 0 ? parseFloat(((totals.TP_Made / totals.TP_Att) * 100).toFixed(1)) : 0;
            avg["FT%"] = totals.FT_Att > 0 ? parseFloat(((totals.FT_Made / totals.FT_Att) * 100).toFixed(1)) : 0;

            seasonAverages[season] = avg;
        }
    }

    function handleSeasonChange(e: Event) {
        selectedSeason = (e.target as HTMLSelectElement).value;
        games = playerGames.filter((g) => g.SEASON === selectedSeason);
        calculateAverages();
    }
</script>

<main class="p-8 bg-[#000536] text-white min-h-screen">
    {#if loading}
        <p>⏳ Laen mängija andmeid...</p>
    {:else}
        <div class="flex items-center gap-6 mb-8">
            <img src={playerImageUrl} alt={playerName}
                 class="w-28 h-28 rounded-xl object-cover border-2 border-[#03538b]"/>
            <div>
                <h1 class="text-4xl font-bold text-[#03a9f4] mb-1">{playerName}</h1>

                {#if playerOverall !== null}
                    <div class="flex items-center gap-2 mb-2">
                        <span class="text-sm text-gray-300">Overall:</span>

                        {#if editingOverall}
                            <input type="number" bind:value={newOverall} min="25" max="99"
                                   class="w-16 px-2 py-1 text-sm rounded-md bg-[#002366] border border-[#03538b] focus:outline-none focus:ring-2 focus:ring-[#03a9f4]" />
                            <button class="px-2 py-1 bg-[#03538b] hover:bg-[#046ab8] rounded-md text-sm"
                                    on:click={saveOverall}>💾</button>
                            <button class="px-2 py-1 bg-gray-600 hover:bg-gray-500 rounded-md text-sm"
                                    on:click={() => { editingOverall = false; newOverall = playerOverall; }}>✕</button>
                        {:else}
                            <span class="text-lg font-bold text-yellow-400">{playerOverall}</span>
                            {#if $user}
                                <button class="ml-1 px-2 py-0.5 bg-[#03538b] hover:bg-[#046ab8] rounded-md text-xs"
                                        on:click={() => editingOverall = true}>✏️</button>
                            {/if}
                        {/if}
                    </div>
                {/if}

                <label class="text-sm opacity-80">Hooaeg:</label>
                <select bind:value={selectedSeason} on:change={handleSeasonChange}
                        class="ml-2 px-2 py-1 bg-[#03538b] rounded-lg text-white border border-[#046ab8]">
                    {#each playedSeasons as season}
                        <option value={season}>{season}</option>
                    {/each}
                </select>
            </div>
        </div>

        <!-- Hooaja keskmised -->
        <div class="bg-[#001048] rounded-2xl p-6 mb-6 shadow-lg">
            <h2 class="text-xl font-semibold mb-3 text-[#03a9f4]">🏀 Hooaja keskmised</h2>
            <div class="grid grid-cols-3 md:grid-cols-6 gap-4 text-center">
                {#each Object.entries(averages) as [key, val]}
                    <div class="bg-[#022c56] p-3 rounded-xl">
                        <div class="text-lg font-bold text-[#03a9f4]">{val}</div>
                        <div class="text-xs opacity-70">{key}</div>
                    </div>
                {/each}
            </div>
        </div>

        <!-- Mängud -->
        <h2 class="text-xl font-semibold mb-3 text-[#03a9f4]">📅 Mängud hooajal {selectedSeason}</h2>
        <table class="w-full text-sm rounded-xl overflow-hidden border border-[#02315e]">
            <thead class="bg-[#03538b]">
            <tr>
                <th class="py-2 px-3 text-left">Kuupäev</th>
                <th class="py-2 px-3 text-left">Mäng</th>
                <th class="py-2 px-3 text-left">Skoor</th>
                <th class="py-2 px-3 text-center">PTS</th>
                <th class="py-2 px-3 text-center">REB</th>
                <th class="py-2 px-3 text-center">AST</th>
                <th class="py-2 px-3 text-center">STL</th>
                <th class="py-2 px-3 text-center">BLK</th>
                <th class="py-2 px-3 text-center">TO</th>
                <th class="py-2 px-3 text-center">FLS</th>
                <th class="py-2 px-3 text-center">FG</th>
                <th class="py-2 px-3 text-center">3PT</th>
                <th class="py-2 px-3 text-center">FT</th>
                {#if $user}<th class="py-2 px-3 text-center">Muuda</th>{/if}
            </tr>
            </thead>
            <tbody>
            {#each games as g}
                <tr class="odd:bg-[#001048] even:bg-[#00093a] hover:bg-[#022c56] transition">
                    <td class="py-2 px-3">{g.GAME_DATE}</td>
                    <td class="px-3">{g.VS_LABEL}</td>
                    <td class="text-left">{g.SCORE_DETAIL} <span class="ml-1 font-bold text-[#03a9f4]">{g.RESULT}</span></td>
                    <td class="text-center">{g.PTS}</td>
                    <td class="text-center">{g.REB}</td>
                    <td class="text-center">{g.AST}</td>
                    <td class="text-center">{g.STL}</td>
                    <td class="text-center">{g.BLK}</td>
                    <td class="text-center">{g.TO}</td>
                    <td class="text-center">{g.FLS}</td>
                    <td class="text-center">{g.FG || "-"}</td>
                    <td class="text-center">{g["3PT"] || "-"}</td>
                    <td class="text-center">{g.FT || "-"}</td>
                    {#if $user}
                        <td class="text-center">
                            <button class="px-2 py-1 bg-[#03538b] hover:bg-[#046ab8] rounded text-white text-xs"
                                    on:click={() => openEditModal(g)}>✏️</button>
                        </td>
                    {/if}
                </tr>
            {/each}
            </tbody>
        </table>

        <!-- Kõigi hooaegade keskmised -->
        <h2 class="text-xl font-semibold mt-10 mb-3 text-[#03a9f4]">📊 Kõigi hooaegade keskmised</h2>
        <table class="w-full text-sm rounded-xl overflow-hidden border border-[#02315e] mb-12">
            <thead class="bg-[#03538b]">
            <tr>
                <th class="py-2 px-3 text-left">Hooaeg</th>
                <th class="py-2 px-3 text-center">GP</th>
                <th class="py-2 px-3 text-center">PTS</th>
                <th class="py-2 px-3 text-center">REB</th>
                <th class="py-2 px-3 text-center">AST</th>
                <th class="py-2 px-3 text-center">STL</th>
                <th class="py-2 px-3 text-center">BLK</th>
                <th class="py-2 px-3 text-center">TO</th>
                <th class="py-2 px-3 text-center">FLS</th>
                <th class="py-2 px-3 text-center">FG%</th>
                <th class="py-2 px-3 text-center">3PT%</th>
                <th class="py-2 px-3 text-center">FT%</th>
            </tr>
            </thead>
            <tbody>
            {#each Object.entries(seasonAverages).sort((a, b) => b[0].localeCompare(a[0])) as [season, stats]}
            <tr class="odd:bg-[#001048] even:bg-[#00093a] hover:bg-[#022c56] transition">
                    <td class="py-2 px-3">{season}</td>
                    <td class="text-center">{seasonGameCounts[season]}</td>
                    <td class="text-center">{stats.PTS}</td>
                    <td class="text-center">{stats.REB}</td>
                    <td class="text-center">{stats.AST}</td>
                    <td class="text-center">{stats.STL}</td>
                    <td class="text-center">{stats.BLK}</td>
                    <td class="text-center">{stats.TO}</td>
                    <td class="text-center">{stats.FLS}</td>
                    <td class="text-center">{stats["FG%"]}</td>
                    <td class="text-center">{stats["3PT%"]}</td>
                    <td class="text-center">{stats["FT%"]}</td>
                </tr>
            {/each}
            </tbody>
        </table>
    {/if}
    {#if showEditModal}
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div class="relative bg-[#00154f] border border-[#03538b] rounded-2xl shadow-2xl w-full max-w-md p-5 text-white animate-fadeIn">
                <button
                        class="absolute top-2 right-2 text-gray-400 hover:text-white transition"
                        on:click={() => (showEditModal = false)}
                        aria-label="Sulge"
                >
                    ✕
                </button>

                <h2 class="text-lg font-semibold text-[#03a9f4] mb-3">
                    Muuda mängu <span class="text-white">{selectedGame?.GAME_DATE}</span>
                </h2>
                <p class="text-sm text-gray-300 mb-4">{selectedGame?.TEAM} {selectedGame?.VS_LABEL}</p>

                <div class="grid grid-cols-2 gap-3 mb-4">
                    {#each Object.keys(editStats) as key}
                        <div>
                            <label class="block text-xs text-gray-400 mb-1 uppercase tracking-wide">{key}</label>
                            <input
                                    type="text"
                                    bind:value={editStats[key]}
                                    class="w-full px-2 py-1.5 text-sm rounded-md bg-[#002366] border border-[#03538b] focus:outline-none focus:ring-2 focus:ring-[#03a9f4] transition"
                            />
                        </div>
                    {/each}
                </div>

                <div class="flex justify-end gap-3">
                    <button
                            class="px-3 py-1.5 text-sm bg-gray-600 hover:bg-gray-500 rounded-md transition"
                            on:click={() => (showEditModal = false)}
                    >
                        Loobu
                    </button>
                    <button
                            class="px-3 py-1.5 text-sm bg-[#03538b] hover:bg-[#046ab8] rounded-md transition"
                            on:click={saveStats}
                    >
                        Salvesta
                    </button>
                </div>
            </div>
        </div>

        <style>
            @keyframes fadeIn {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
            }
            .animate-fadeIn {
                animation: fadeIn 0.2s ease-out;
            }
        </style>
    {/if}

</main>

<style>
    select:focus {
        outline: none;
        box-shadow: 0 0 0 2px #046ab8;
    }
</style>
