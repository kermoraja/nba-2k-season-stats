<script lang="ts">
    import { onMount } from "svelte";
    import { params } from "svelte-spa-router";
    import { collection, getDocs } from "firebase/firestore";
    import { db } from "../../lib/firebase";
    import { getImageUrl } from "../../lib/utils/images";

    let playerName = "";
    let allSeasons: string[] = [];
    let selectedSeason = "";
    let games: any[] = [];
    let averages: Record<string, number> = {};
    let loading = true;
    let playerImageUrl = "";

    $: rawParam = $params?.name ?? "";
    $: playerName = rawParam.replace("-", ". ");

    onMount(async () => {
        loading = true;
        const snapshot = await getDocs(collection(db, "games"));

        const playerGames: any[] = [];
        const seasonsSet = new Set<string>();

        snapshot.forEach((doc) => {
            const data = doc.data();
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
            const locMarker = isHome ? "vs" : "@"; // ilus märgistus

            const awayScore = data.GAME_SUMMARY?.AWAY_TEAM_TOTAL || 0;
            const homeScore = data.GAME_SUMMARY?.HOME_TEAM_TOTAL || 0;

            playerGames.push({
                SEASON: data.SEASON,
                GAME_DATE: data.GAME_DATE,
                TEAM: team,
                OPPONENT: opponent,
                IS_HOME: isHome,
                VS_LABEL: `${locMarker} ${opponent}`,
                SCORE: `${homeScore} - ${awayScore}`,
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
        selectedSeason = allSeasons[0] ?? "";
        games = playerGames.filter((g) => g.SEASON === selectedSeason);

        if (games.length > 0) {
            calculateAverages();
        }

        playerImageUrl = getImageUrl(playerName);
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

    function handleSeasonChange(e: Event) {
        selectedSeason = (e.target as HTMLSelectElement).value;
        games = games.filter((g) => g.SEASON === selectedSeason);
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
                <label class="text-sm opacity-80">Hooaeg:</label>
                <select bind:value={selectedSeason} on:change={handleSeasonChange}
                        class="ml-2 px-2 py-1 bg-[#03538b] rounded-lg text-white border border-[#046ab8]">
                    {#each allSeasons as season}
                        <option value={season}>{season}</option>
                    {/each}
                </select>
            </div>
        </div>

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

        <h2 class="text-xl font-semibold mb-3 text-[#03a9f4]">📅 Mängud hooajal {selectedSeason}</h2>
        <table class="hidden sm:table w-full text-sm rounded-xl overflow-hidden border border-[#02315e]">
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
                </tr>
            {/each}
            </tbody>
        </table>

        <div class="sm:hidden space-y-4">
            {#each games as g}
                <div class="bg-[#00093a]/60 backdrop-blur-md border border-[#03538b]/50 rounded-2xl p-4 shadow-lg hover:shadow-[#03538b]/30 transition-all">
                    <div class="flex justify-between items-center text-sm text-[#8fbce6] mb-3">
                        <span class="font-medium">{g.GAME_DATE}</span>
                        <span class="uppercase text-xs bg-[#03538b]/20 px-2 py-0.5 rounded-md">
                        {g.VS_LABEL}
                        </span>
                    </div>

                    <div class="grid grid-cols-3 gap-y-3 text-center text-white text-sm">
                        <div>
                            <div class="text-[#8fbce6] text-xs font-semibold">PTS</div>
                            <div class="text-lg font-bold">{g.PTS}</div>
                        </div>
                        <div>
                            <div class="text-[#8fbce6] text-xs font-semibold">REB</div>
                            <div class="text-lg font-bold">{g.REB}</div>
                        </div>
                        <div>
                            <div class="text-[#8fbce6] text-xs font-semibold">AST</div>
                            <div class="text-lg font-bold">{g.AST}</div>
                        </div>

                        <div>
                            <div class="text-[#8fbce6] text-xs font-semibold">STL</div>
                            <div class="text-lg font-bold">{g.STL}</div>
                        </div>
                        <div>
                            <div class="text-[#8fbce6] text-xs font-semibold">BLK</div>
                            <div class="text-lg font-bold">{g.BLK}</div>
                        </div>
                        <div>
                            <div class="text-[#8fbce6] text-xs font-semibold">TO</div>
                            <div class="text-lg font-bold">{g.TO}</div>
                        </div>
                        <div>
                            <div class="text-[#8fbce6] text-xs font-semibold">FG%</div>
                            <div class="text-lg font-bold">{g.FG}</div>
                        </div>
                        <div>
                            <div class="text-[#8fbce6] text-xs font-semibold">3PT%</div>
                            <div class="text-lg font-bold">{g["3PT"]}</div>
                        </div>
                        <div>
                            <div class="text-[#8fbce6] text-xs font-semibold">FT%</div>
                            <div class="text-lg font-bold">{g.FT}</div>
                        </div>

                    </div>
                </div>
            {/each}
        </div>
    {/if}
</main>

<style>
    select:focus {
        outline: none;
        box-shadow: 0 0 0 2px #046ab8;
    }
</style>
