<script lang="ts">
    import { onMount } from "svelte";
    import { params } from "svelte-spa-router";
    import { collection, getDocs, getDoc, updateDoc, doc } from "firebase/firestore";
    import { user } from "../../lib/stores/userStore";
    import { db } from "../../lib/firebase";
    import { getImageUrl } from "../../lib/utils/images";
    import { link } from "svelte-spa-router";

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
    let seasonGameCounts: Record<string, number> = {};

    // 🔥 UUS
    let teammates: any[] = [];
    let playerTeam: string = "";

    $: rawParam = $params?.name ?? "";
    $: playerName = rawParam.replace(/-/g, " ").replace(/~/g, ".");

    $: if ($params?.name) {
        reloadPlayerData();
    }

    function openEditModal(game: any) {
        if (!$user) return;
        selectedGame = game;
        editStats = {
            PTS: game.PTS,
            MIN: game.MIN,
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
        if (!selectedGame?.ref) return alert("Mängu dokumenti ei leitud.");
        try {
            const path = selectedGame.IS_HOME
                ? "HOME_TEAM_PLAYER_STATS"
                : "AWAY_TEAM_PLAYER_STATS";

            const snapshot = await getDoc(selectedGame.ref);
            const data = snapshot.data();
            if (!data) return;

            const arr = data[path];
            const playerIndex = arr.findIndex((p: any) => p.NAME === playerName);
            if (playerIndex === -1) return alert("Mängijat ei leitud.");

            Object.entries(editStats).forEach(([k, v]) => (arr[playerIndex][k] = v));
            await updateDoc(selectedGame.ref, { [path]: arr });

            Object.assign(selectedGame, editStats);
            showEditModal = false;
        } catch (err) {
            console.error(err);
            alert("Viga.");
        }
    }

    async function saveOverall() {
        try {
            if (!newOverall || isNaN(newOverall)) return alert("Vale number.");

            const playerId = rawParam.toLowerCase().replace(/~/g, ".");
            const playerRef = doc(db, "players", playerId);

            await updateDoc(playerRef, { overall: Number(newOverall) });

            playerOverall = Number(newOverall);
            editingOverall = false;
        } catch (err) {
            console.error(err);
            alert("Viga.");
        }
    }

    onMount(reloadPlayerData);

    async function reloadPlayerData() {
        loading = true;
        const snapshot = await getDocs(collection(db, "games"));
        const seasonsSet = new Set<string>();

        snapshot.forEach((docu) => {
            const data = docu.data();
            seasonsSet.add(data.SEASON);

            const homeArr = data.HOME_TEAM_PLAYER_STATS || [];
            const awayArr = data.AWAY_TEAM_PLAYER_STATS || [];

            const inHome = homeArr.some((p) => p.NAME === playerName);
            const inAway = awayArr.some((p) => p.NAME === playerName);

            if (!inHome && !inAway) return;

            const stat = (inHome ? homeArr : awayArr).find((p) => p.NAME === playerName);
            const isHome = inHome;
            const team = isHome ? data.HOME_TEAM : data.AWAY_TEAM;

            const opponent = isHome ? data.AWAY_TEAM : data.HOME_TEAM;
            const locMarker = isHome ? "vs" : "@";

            const awayScore = data.GAME_SUMMARY?.AWAY_TEAM_TOTAL || 0;
            const homeScore = data.GAME_SUMMARY?.HOME_TEAM_TOTAL || 0;

            playerGames.push({
                id: docu.id,
                ref: docu.ref,
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
        playedSeasons = allSeasons.filter(s => playerGames.some(g => g.SEASON === s));
        playedSeasons.sort((a, b) => a.localeCompare(b));

        selectedSeason = playedSeasons[playedSeasons.length - 1];
        games = playerGames.filter(g => g.SEASON === selectedSeason);

        if (games.length > 0) calculateAverages();
        calculateSeasonAverages();

        playerImageUrl = getImageUrl(playerName);

        if (playerGames.length > 0) {
            playerTeam = playerGames[playerGames.length - 1].TEAM;
        }

        const allPlayersSnap = await getDocs(collection(db, "players"));
        const allPlayers: any[] = [];
        allPlayersSnap.forEach((d) => allPlayers.push(d.data()));

        teammates = allPlayers
            .filter(p => p.team === playerTeam && p.name !== playerName)
            .sort((a, b) => a.name.localeCompare(b.name));

        const playerId = rawParam.toLowerCase().replace(/~/g, ".");
        const playerRef = doc(db, "players", playerId);
        const snap = await getDoc(playerRef);

        if (snap.exists()) {
            playerOverall = snap.data().overall ?? null;
            newOverall = playerOverall;
        }

        console.log(teammates)

        loading = false;
    }

    function calculateAverages() {
        const sum: any = { MIN: 0, PTS: 0, REB: 0, AST: 0, STL: 0, BLK: 0, TO: 0, FLS: 0 };
        const totals = { FG_Made: 0, FG_Att: 0, TP_Made: 0, TP_Att: 0, FT_Made: 0, FT_Att: 0 };

        games.forEach((g) => {
            for (const key in sum) sum[key] += Number(g[key] || 0);

            if (g.FG) {
                const [m, a] = g.FG.split("-").map(Number);
                totals.FG_Made += m || 0; totals.FG_Att += a || 0;
            }
            if (g["3PT"]) {
                const [m, a] = g["3PT"].split("-").map(Number);
                totals.TP_Made += m || 0; totals.TP_Att += a || 0;
            }
            if (g.FT) {
                const [m, a] = g.FT.split("-").map(Number);
                totals.FT_Made += m || 0; totals.FT_Att += a || 0;
            }
        });

        const totalGames = games.length || 1;
        for (const key in sum) averages[key] = parseFloat((sum[key] / totalGames).toFixed(1));

        averages["FG%"] = totals.FG_Att ? parseFloat(((totals.FG_Made / totals.FG_Att) * 100).toFixed(1)) : 0;
        averages["3PT%"] = totals.TP_Att ? parseFloat(((totals.TP_Made / totals.TP_Att) * 100).toFixed(1)) : 0;
        averages["FT%"] = totals.FT_Att ? parseFloat(((totals.FT_Made / totals.FT_Att) * 100).toFixed(1)) : 0;
    }

    function calculateSeasonAverages() {
        seasonAverages = {};
        seasonGameCounts = {};

        for (const season of playedSeasons) {
            const seasonGames = playerGames.filter(g => g.SEASON === season);
            if (seasonGames.length === 0) continue;

            seasonGameCounts[season] = seasonGames.length;

            const sum: any = { MIN: 0, PTS: 0, REB: 0, AST: 0, STL: 0, BLK: 0, TO: 0, FLS: 0 };
            const totals = { FG_Made: 0, FG_Att: 0, TP_Made: 0, TP_Att: 0, FT_Made: 0, FT_Att: 0 };

            seasonGames.forEach((g) => {
                for (const key in sum) sum[key] += Number(g[key] || 0);

                if (g.FG) {
                    const [m, a] = g.FG.split("-").map(Number);
                    totals.FG_Made += m || 0; totals.FG_Att += a || 0;
                }
                if (g["3PT"]) {
                    const [m, a] = g["3PT"].split("-").map(Number);
                    totals.TP_Made += m || 0; totals.TP_Att += a || 0;
                }
                if (g.FT) {
                    const [m, a] = g.FT.split("-").map(Number);
                    totals.FT_Made += m || 0; totals.FT_Att += a || 0;
                }
            });

            const totalGames = seasonGames.length;
            const avg: any = {};

            for (const key in sum) avg[key] = parseFloat((sum[key] / totalGames).toFixed(1));
            avg["FG%"] = totals.FG_Att ? parseFloat(((totals.FG_Made / totals.FG_Att) * 100).toFixed(1)) : 0;
            avg["3PT%"] = totals.TP_Att ? parseFloat(((totals.TP_Made / totals.TP_Att) * 100).toFixed(1)) : 0;
            avg["FT%"] = totals.FT_Att ? parseFloat(((totals.FT_Made / totals.FT_Att) * 100).toFixed(1)) : 0;

            seasonAverages[season] = avg;
        }
    }

    function handleSeasonChange(e: Event) {
        selectedSeason = (e.target as HTMLSelectElement).value;
        games = playerGames.filter(g => g.SEASON === selectedSeason);
        calculateAverages();
    }
</script>

<main class="p-8 bg-[#000536] text-white min-h-screen">
    {#if loading}
        <p>⏳ Laen mängija andmeid...</p>
    {:else}

        <!-- MÄNGIJA PEABLOKK -->
        <div class="flex items-center gap-6 mb-6">
            <img src={playerImageUrl} class="w-28 h-28 rounded-xl border-2 border-[#03538b] object-cover" />

            <div>
                <h1 class="text-4xl font-bold text-[#03a9f4] mb-1">{playerName}</h1>

                {#if playerOverall !== null}
                    <div class="flex items-center gap-2 mb-2">
                        <span class="text-sm opacity-80">Overall:</span>

                        {#if editingOverall}
                            <input type="number" bind:value={newOverall} class="w-16 px-2 py-1 text-sm bg-[#002366] border border-[#03538b] rounded"/>
                            <button on:click={saveOverall} class="px-2 bg-[#03538b] rounded">💾</button>
                            <button on:click={() => { editingOverall = false; newOverall = playerOverall; }} class="px-2 bg-gray-600 rounded">✕</button>
                        {:else}
                            <span class="text-xl font-bold text-yellow-400">{playerOverall}</span>
                            {#if $user}
                                <button class="px-2 bg-[#03538b] rounded text-xs" on:click={() => editingOverall = true}>✏️</button>
                            {/if}
                        {/if}
                    </div>
                {/if}

                <label class="opacity-80">Hooaeg:</label>
                <select bind:value={selectedSeason} on:change={handleSeasonChange}
                        class="ml-2 bg-[#03538b] rounded px-2 py-1 border border-[#046ab8]">
                    {#each playedSeasons as s}
                        <option value={s}>{s}</option>
                    {/each}
                </select>
            </div>
        </div>

        <!-- 🔥 TIIMIKAASLASTE PILDID -->
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

        <!-- HOOAJA KESKMISED -->
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

        <!-- MÄNGUDE TABEL -->
        <h2 class="text-xl font-semibold text-[#03a9f4] mb-3">📅 Mängud hooajal {selectedSeason}</h2>
        <table class="w-full text-sm border border-[#02315e] rounded-xl overflow-hidden">
            <thead class="bg-[#03538b]">
            <tr>
                <th class="py-2 px-3 text-left">Kuupäev</th>
                <th class="py-2 px-3 text-left">Mäng</th>
                <th class="py-2 px-3 text-left">Skoor</th>
                <th class="py-2 px-3">MIN</th>
                <th class="py-2 px-3">PTS</th>
                <th class="py-2 px-3">REB</th>
                <th class="py-2 px-3">AST</th>
                <th class="py-2 px-3">STL</th>
                <th class="py-2 px-3">BLK</th>
                <th class="py-2 px-3">TO</th>
                <th class="py-2 px-3">FLS</th>
                <th class="py-2 px-3">FG</th>
                <th class="py-2 px-3">3PT</th>
                <th class="py-2 px-3">FT</th>
                {#if $user}
                    <th class="py-2 px-3 text-center">Muuda</th>
                {/if}
            </tr>
            </thead>

            <tbody>
            {#each games as g}
                <tr class="odd:bg-[#001048] even:bg-[#00093a] hover:bg-[#022c56]">
                    <td class="py-2 px-3">{g.GAME_DATE}</td>
                    <td class="px-3">{g.VS_LABEL}</td>
                    <td class="px-3">{g.SCORE_DETAIL} <span class="ml-2 font-bold text-[#03a9f4]">{g.RESULT}</span></td>
                    <td class="text-center">{g.MIN}</td>
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
                            <button class="px-2 py-1 bg-[#03538b] rounded text-xs" on:click={() => openEditModal(g)}>✏️</button>
                        </td>
                    {/if}
                </tr>
            {/each}
            </tbody>
        </table>

        <h2 class="text-xl font-semibold text-[#03a9f4] mt-10 mb-3">📊 Kõigi hooaegade keskmised</h2>

        <table class="w-full text-sm border border-[#02315e] rounded-xl overflow-hidden mb-16">
            <thead class="bg-[#03538b]">
            <tr>
                <th class="py-2 px-3 text-left">Hooaeg</th>
                <th class="py-2 px-3">GP</th>
                <th class="py-2 px-3">MIN</th>
                <th class="py-2 px-3">PTS</th>
                <th class="py-2 px-3">REB</th>
                <th class="py-2 px-3">AST</th>
                <th class="py-2 px-3">STL</th>
                <th class="py-2 px-3">BLK</th>
                <th class="py-2 px-3">TO</th>
                <th class="py-2 px-3">FLS</th>
                <th class="py-2 px-3">FG%</th>
                <th class="py-2 px-3">3PT%</th>
                <th class="py-2 px-3">FT%</th>
            </tr>
            </thead>

            <tbody>
            {#each Object.entries(seasonAverages).sort((a, b) => b[0].localeCompare(a[0])) as [season, st]}
                <tr class="odd:bg-[#001048] even:bg-[#00093a] hover:bg-[#022c56]">
                    <td class="py-2 px-3">{season}</td>
                    <td class="text-center">{seasonGameCounts[season]}</td>
                    <td class="text-center">{st.MIN.toFixed(1)}</td>
                    <td class="text-center">{st.PTS.toFixed(1)}</td>
                    <td class="text-center">{st.REB.toFixed(1)}</td>
                    <td class="text-center">{st.AST.toFixed(1)}</td>
                    <td class="text-center">{st.STL.toFixed(1)}</td>
                    <td class="text-center">{st.BLK.toFixed(1)}</td>
                    <td class="text-center">{st.TO.toFixed(1)}</td>
                    <td class="text-center">{st.FLS.toFixed(1)}</td>
                    <td class="text-center">{st["FG%"]}</td>
                    <td class="text-center">{st["3PT%"]}</td>
                    <td class="text-center">{st["FT%"]}</td>
                </tr>
            {/each}
            </tbody>
        </table>
    {/if}

    <!-- EDIT MODAL — unchanged -->
    {#if showEditModal}
        <div class="fixed inset-0 bg-black/60 flex items-center justify-center p-4">
            <div class="bg-[#00154f] border border-[#03538b] rounded-xl p-6 w-full max-w-md relative">

                <button class="absolute top-2 right-2" on:click={() => showEditModal = false}>✕</button>

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
                    <button class="px-3 py-1 bg-gray-600 rounded" on:click={() => showEditModal = false}>Loobu</button>
                    <button class="px-3 py-1 bg-[#03538b] rounded" on:click={saveStats}>Salvesta</button>
                </div>
            </div>
        </div>
    {/if}
</main>


<style>
    select:focus {
        outline: none;
        box-shadow: 0 0 0 2px #046ab8;
    }
</style>
