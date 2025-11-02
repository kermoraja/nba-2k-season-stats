import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export async function getPlayerSeasonStats(playerName: string, season: string) {
    const snapshot = await getDocs(collection(db, "games"));
    const games: any[] = [];

    snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.SEASON !== season) return;

        const allPlayers = [
            ...(data.AWAY_TEAM_PLAYER_STATS || []),
            ...(data.HOME_TEAM_PLAYER_STATS || []),
        ];

        const player = allPlayers.find((p) => p.NAME?.trim() === playerName.trim());
        if (player) {
            games.push({
                date: data.GAME_DATE,
                vs: `${data.AWAY_TEAM} @ ${data.HOME_TEAM}`,
                team:
                    data.AWAY_TEAM_PLAYER_STATS.find((p) => p.NAME === playerName)
                        ? data.AWAY_TEAM
                        : data.HOME_TEAM,
                ...player,
            });
        }
    });

    return games.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}
