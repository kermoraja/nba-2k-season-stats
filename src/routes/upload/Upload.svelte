<script lang="ts">
    import { doc, setDoc } from "firebase/firestore";
    import { db } from "../../lib/firebase";
    import { user, loadingUser } from "../../lib/stores/userStore";
    import LoginForm from "../../components/Login.svelte"

    let team1File: File | null = null;
    let team2File: File | null = null;
    let season = "2024-25";
    let status = "";

    async function handleUpload() {
        if (!team1File || !team2File) {
            status = "❌ Palun vali mõlemad JSON-failid!";
            return;
        }

        try {
            const [team1Text, team2Text] = await Promise.all([
                team1File.text(),
                team2File.text(),
            ]);

            const team1 = JSON.parse(team1Text);
            const team2 = JSON.parse(team2Text);

            const gameData = {
                SEASON: season,
                GAME_DATE: new Date().toISOString().split("T")[0],
                AWAY_TEAM: team1.TEAM_STATS?.TEAM_NAME || "AWAY",
                HOME_TEAM: team2.TEAM_STATS?.TEAM_NAME || "HOME",
                AWAY_TEAM_PLAYER_STATS: team1.PLAYER_STATS || [],
                HOME_TEAM_PLAYER_STATS: team2.PLAYER_STATS || [],
                GAME_SUMMARY: {
                    AWAY_TEAM_TOTAL: team1.GAME_SUMMARY?.AWAY_TEAM_SCORE?.TOTAL || null,
                    HOME_TEAM_TOTAL: team2.GAME_SUMMARY?.HOME_TEAM_SCORE?.TOTAL || null,
                },
            };

            const gameId = `${gameData.AWAY_TEAM}-vs-${gameData.HOME_TEAM}-${gameData.GAME_DATE}`;
            await setDoc(doc(db, "games", gameId), gameData);

            status = `✅ Mäng salvestatud: ${gameData.AWAY_TEAM} vs ${gameData.HOME_TEAM}`;
        } catch (err) {
            console.error(err);
            status = "❌ Tekkis viga üleslaadimisel!";
        }
    }

    function handleTeam1File(e: Event) {
        const input = e.target as HTMLInputElement;
        if (input?.files?.length) team1File = input.files[0];
    }

    function handleTeam2File(e: Event) {
        const input = e.target as HTMLInputElement;
        if (input?.files?.length) team2File = input.files[0];
    }
</script>

{#if $loadingUser}
    <p>Kontrollin kasutajat...</p>
{:else if !$user}
    <LoginForm />
{:else}
    <!-- Upload lehe sisu -->

    <main class="min-h-screen flex items-center justify-center bg-[#f4f6fa] p-4">
        <div class="bg-white w-full max-w-lg rounded-2xl shadow-lg p-8 border border-gray-100">
            <h1 class="text-2xl font-semibold text-[#03538b] text-center mb-6">
                📤 Lae üles mängu statistika
            </h1>

            <div class="flex flex-col gap-5">
                <div>
                    <label for="team1" class="block text-sm font-medium text-gray-700 mb-1">
                        Tiim 1 JSON:
                    </label>
                    <input
                            id="team1"
                            type="file"
                            accept=".json"
                            on:change={handleTeam1File}
                            class="block w-full text-sm text-gray-600 border border-gray-300 rounded-lg cursor-pointer bg-white
              focus:outline-none focus:ring-2 focus:ring-[#03538b] file:py-2 file:px-4 file:rounded-lg
              file:border-0 file:text-sm file:font-semibold file:bg-[#03538b] file:text-white hover:file:bg-[#046ab8]"
                    />
                </div>

                <div>
                    <label for="team2" class="block text-sm font-medium text-gray-700 mb-1">
                        Tiim 2 JSON:
                    </label>
                    <input
                            id="team2"
                            type="file"
                            accept=".json"
                            on:change={handleTeam2File}
                            class="block w-full text-sm text-gray-600 border border-gray-300 rounded-lg cursor-pointer bg-white
              focus:outline-none focus:ring-2 focus:ring-[#03538b] file:py-2 file:px-4 file:rounded-lg
              file:border-0 file:text-sm file:font-semibold file:bg-[#03538b] file:text-white hover:file:bg-[#046ab8]"
                    />
                </div>

                <div>
                    <label for="season" class="block text-sm font-medium text-gray-700 mb-1">
                        Hooaeg:
                    </label>
                    <input
                            id="season"
                            bind:value={season}
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#03538b]"
                    />
                </div>

                <button
                        on:click={handleUpload}
                        class="mt-2 bg-[#03538b] hover:bg-[#046ab8] text-white font-semibold px-4 py-3 rounded-lg transition"
                >
                    Lae üles mäng
                </button>

                <p class="mt-4 text-center text-sm text-gray-700">{status}</p>
            </div>
        </div>
    </main>
{/if}