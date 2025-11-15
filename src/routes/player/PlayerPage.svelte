<script lang="ts">
    import { onMount } from "svelte";
    import { params } from "svelte-spa-router";
    import { doc, getDoc, getDocs, collection, updateDoc } from "firebase/firestore";
    import { user } from "../../lib/stores/userStore";
    import { db } from "../../lib/firebase";
    import { getImageUrl } from "../../lib/utils/images";

    import { gameStore, loadGamesOnce } from "../../lib/stores/gameStore";
    import PlayerHeader from "../../components/player/PlayerHeader.svelte";
    import TeammatesList from "../../components/player/TeammatesList.svelte";
    import SeasonAverages from "../../components/player/SeasonAverages.svelte";
    import GameTable from "../../components/player/GameTable.svelte";
    import EditGameModal from "../../components/player/EditGameModal.svelte";
    import AllSeasonsTable from "../../components/player/AllSeasonsTable.svelte";

    let rawParam = "";
    let playerName = "";
    let playerId = "";
    let loading = true;

    let playerImageUrl = "";
    let playerOverall = null;
    let editingOverall = false;
    let newOverall = null;

    let playerGames = [];
    let games = [];
    let playedSeasons = [];
    let selectedSeason = "";
    let averages = {};
    let seasonAverages = {};
    let seasonGameCounts = {};

    let teammates = [];
    let playerTeam = "";

    let showEditModal = false;
    let selectedGame = null;
    let editStats = {};

    $: rawParam = $params?.name ?? "";
    $: playerName = urlNameToPlayerName(rawParam);
    $: playerId = playerNameToId(playerName);

    function applySuffixDot(rest: string) {
        const suffixesWithDot = ["jr", "sr"];
        for (const s of suffixesWithDot) {
            if (rest.endsWith(s)) {
                return rest + ".";
            }
        }
        return rest;
    }

    export function playerNameToId(name: string) {
        const m = name.match(/^([A-Za-z])\.\s*(.*)$/);

        if (!m) return name.toLowerCase().replace(/ /g, "-");

        const first = m[1].toLowerCase();

        let rest = m[2]
            .toLowerCase()
            .replace(/\./g, "")
            .replace(/ /g, "-");

        rest = applySuffixDot(rest);

        return `${first}.-${rest}`;
    }

    export function urlNameToPlayerName(url: string) {
        let name = url.replace(/~/g, ".");

        name = name.replace(/^([A-Za-z]\.)-/, "$1 ");

        name = name.replace(/-([A-Za-z]+)\.$/, "-$1");

        return name;
    }

    onMount(() => {
        if (!$gameStore.loaded) {
            loadGamesOnce();
        }
    });

    $: if ($gameStore.loaded && $params?.name) {
        reloadPlayerData();
    }

    function normalizeGameName(name: string) {
        return name
            .replace(/\s+Jr\./i, "-Jr")
            .replace(/\s+Jr$/i, "-Jr")

            .replace(/--+/g, "-")

            .trim();
    }

    async function reloadPlayerData() {
        loading = true;

        const allGames = $gameStore.games;
        playerGames = [];

        allGames.forEach(g => {
            const homeArr = g.HOME_TEAM_PLAYER_STATS || [];
            const awayArr = g.AWAY_TEAM_PLAYER_STATS || [];

            const inHome = homeArr.some((p) => normalizeGameName(p.NAME) === playerName);
            const inAway = awayArr.some((p) => normalizeGameName(p.NAME) === playerName);

            if (!inHome && !inAway) return;

            const stat = (inHome ? homeArr : awayArr).find((p) => normalizeGameName(p.NAME) === playerName);
            const isHome = inHome;
            const team = isHome ? g.HOME_TEAM : g.AWAY_TEAM;
            const opponent = isHome ? g.AWAY_TEAM : g.HOME_TEAM;

            const homeScore = g.GAME_SUMMARY?.HOME_TEAM_TOTAL || 0;
            const awayScore = g.GAME_SUMMARY?.AWAY_TEAM_TOTAL || 0;

            playerGames.push({
                id: g.id,
                ref: g.ref,
                SEASON: g.SEASON,
                GAME_DATE: g.GAME_DATE,
                TEAM: team,
                OPPONENT: opponent,
                IS_HOME: isHome,
                VS_LABEL: isHome ? `vs ${opponent}` : `@ ${opponent}`,
                SCORE_DETAIL: isHome
                    ? `${team} ${homeScore} - ${awayScore} ${opponent}`
                    : `${team} ${awayScore} - ${homeScore} ${opponent}`,
                RESULT: isHome
                    ? homeScore > awayScore ? "W" : "L"
                    : awayScore > homeScore ? "W" : "L",
                ...stat
            });
        });

        playerGames.sort((a, b) => new Date(a.GAME_DATE).getTime() - new Date(b.GAME_DATE).getTime());

        const seasonsSet = new Set(playerGames.map(g => g.SEASON));
        playedSeasons = [...seasonsSet].sort();

        selectedSeason = playedSeasons[playedSeasons.length - 1] || "";
        games = playerGames.filter(g => g.SEASON === selectedSeason);

        calculateAverages();
        calculateSeasonAverages();

        playerImageUrl = getImageUrl(playerName);

        const playerSnap = await getDoc(doc(db, "players", playerId));
        if (playerSnap.exists()) {
            playerOverall = playerSnap.data().overall ?? null;
            newOverall = playerOverall;
            playerTeam = playerSnap.data().team ?? "";
        }

        const allPlayersSnap = await getDocs(collection(db, "players"));
        const all = [];
        allPlayersSnap.forEach(d => all.push(d.data()));

        teammates = all
            .filter(p => p.team === playerTeam && p.name !== playerName)
            .sort((a, b) => a.name.localeCompare(b.name));

        console.log(teammates)
        loading = false;
    }

    function calculateAverages() {
        const sum = { MIN: 0, PTS: 0, REB: 0, AST: 0, STL: 0, BLK: 0, TO: 0, FLS: 0 };
        const totals = { FG_Made: 0, FG_Att: 0, TP_Made: 0, TP_Att: 0, FT_Made: 0, FT_Att: 0 };

        games.forEach(g => {
            Object.keys(sum).forEach(k => sum[k] += Number(g[k] || 0));

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
        averages = {};

        Object.keys(sum).forEach(k => {
            averages[k] = parseFloat((sum[k] / totalGames).toFixed(1));
        });

        averages["FG%"] = totals.FG_Att ? +((totals.FG_Made / totals.FG_Att) * 100).toFixed(1) : 0;
        averages["3PT%"] = totals.TP_Att ? +((totals.TP_Made / totals.TP_Att) * 100).toFixed(1) : 0;
        averages["FT%"] = totals.FT_Att ? +((totals.FT_Made / totals.FT_Att) * 100).toFixed(1) : 0;
    }

    function calculateSeasonAverages() {
        seasonAverages = {};
        seasonGameCounts = {};

        playedSeasons.forEach(season => {
            const seasonGames = playerGames.filter(g => g.SEASON === season);
            if (!seasonGames.length) return;

            seasonGameCounts[season] = seasonGames.length;

            const sum = { MIN: 0, PTS: 0, REB: 0, AST: 0, STL: 0, BLK: 0, TO: 0, FLS: 0 };
            const totals = { FG_Made: 0, FG_Att: 0, TP_Made: 0, TP_Att: 0, FT_Made: 0, FT_Att: 0 };

            seasonGames.forEach(g => {
                Object.keys(sum).forEach(k => sum[k] += Number(g[k] || 0));

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

            const total = seasonGames.length;
            const avg = {};

            Object.keys(sum).forEach(k => avg[k] = +(sum[k] / total).toFixed(1));

            avg["FG%"] = totals.FG_Att ? +((totals.FG_Made / totals.FG_Att) * 100).toFixed(1) : 0;
            avg["3PT%"] = totals.TP_Att ? +((totals.TP_Made / totals.TP_Att) * 100).toFixed(1) : 0;
            avg["FT%"] = totals.FT_Att ? +((totals.FT_Made / totals.FT_Att) * 100).toFixed(1) : 0;

            seasonAverages[season] = avg;
        });
    }

    function handleSeasonChange(e: Event) {
        selectedSeason = (e.target as HTMLSelectElement).value;
        games = playerGames.filter(g => g.SEASON === selectedSeason);
        calculateAverages();
    }

    function openEditModal(g) {
        if (!$user) return;

        selectedGame = g;
        editStats = {
            PTS: g.PTS, MIN: g.MIN, REB: g.REB, AST: g.AST,
            STL: g.STL, BLK: g.BLK, TO: g.TO, FLS: g.FLS,
            FG: g.FG || "", "3PT": g["3PT"] || "", FT: g.FT || ""
        };
        showEditModal = true;
    }

    async function saveStats() {
        if (!selectedGame?.ref) return;

        const path = selectedGame.IS_HOME ? "HOME_TEAM_PLAYER_STATS" : "AWAY_TEAM_PLAYER_STATS";

        const snap = await getDoc(selectedGame.ref);
        const data = snap.data();
        if (!data) return;

        const arr = data[path];
        const playerIndex = arr.findIndex(p => p.NAME === playerName);
        if (playerIndex === -1) return;

        Object.entries(editStats).forEach(([k, v]) => arr[playerIndex][k] = v);

        await updateDoc(selectedGame.ref, { [path]: arr });

        Object.assign(selectedGame, editStats);
        showEditModal = false;
    }

    async function saveOverall() {
        if (!newOverall || isNaN(newOverall)) return;

        await updateDoc(doc(db, "players", playerId), {
            overall: Number(newOverall)
        });

        playerOverall = Number(newOverall);
        editingOverall = false;
    }
</script>

<main>
    <PlayerHeader
            {playerName}
            {playerImageUrl}
            {playerOverall}
            {editingOverall}
            {newOverall}
            {playedSeasons}
            {selectedSeason}
            onStartEditingOverall={() => editingOverall = true}
            onSaveOverall={saveOverall}
            onSeasonChange={handleSeasonChange}
    />

    <TeammatesList {teammates}/>

    <SeasonAverages {averages}/>

    <GameTable
            {games}
            user={$user}
            onEditGame={openEditModal}
    />

    <AllSeasonsTable
            {seasonAverages}
            {seasonGameCounts}
    />

    <EditGameModal
            show={showEditModal}
            {editStats}
            onCancel={() => showEditModal = false}
            onSave={saveStats}
    />
</main>
