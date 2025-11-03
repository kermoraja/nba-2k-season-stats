import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export type PlayerStats = {
    NAME: string
    TEAM: string
    PTS: number
    REB: number
    AST: number
    STL: number
    BLK: number
    TO: number
    MIN: number
    FLS: number
    GAMES: number
    FG_MADE: number
    FG_ATT: number
    FT_MADE: number
    FT_ATT: number
    TP_MADE: number
    TP_ATT: number
    FG_PCT?: number | string
    FT_PCT?: number | string
    TP_PCT?: number | string
    mvpIndex: number
}


export async function getAvailableSeasons(): Promise<string[]> {
    const snapshot = await getDocs(collection(db, "games"));
    const seasons = new Set<string>();
    snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.SEASON) seasons.add(data.SEASON);
    });
    return Array.from(seasons);
}

export async function getSeasonStats(
    seasonName: string
): Promise<{ players: PlayerStats[]; teams: Record<string, PlayerStats[]> }> {
    const snapshot = await getDocs(collection(db, "games"))

    const playersMap: Record<string, PlayerStats> = {}
    const teamsMap: Record<string, Record<string, PlayerStats>> = {}

    snapshot.forEach((doc) => {
        const data = doc.data()
        if (data.SEASON !== seasonName) return

        const awayTeam = data.AWAY_TEAM
        const homeTeam = data.HOME_TEAM
        const awayPlayers = data.AWAY_TEAM_PLAYER_STATS || []
        const homePlayers = data.HOME_TEAM_PLAYER_STATS || []

        const parseMadeAtt = (val: string): [number, number] => {
            if (!val || typeof val !== "string" || !val.includes("-")) return [0, 0]
            const [made, att] = val.split("-").map(Number)
            return [made || 0, att || 0]
        }

        const addPlayer = (target: Record<string, PlayerStats>, player: any, teamName: string) => {
            if (!player?.NAME) return
            const name = player.NAME.trim()

            if (!target[name]) {
                target[name] = {
                    NAME: name,
                    TEAM: teamName,
                    PTS: 0,
                    REB: 0,
                    AST: 0,
                    STL: 0,
                    BLK: 0,
                    TO: 0,
                    MIN: 0,
                    FLS: 0,
                    GAMES: 0,
                    FG_MADE: 0,
                    FG_ATT: 0,
                    FT_MADE: 0,
                    FT_ATT: 0,
                    TP_MADE: 0,
                    TP_ATT: 0,
                    mvpIndex: 0
                }
            }

            const t = target[name]
            t.PTS += Number(player.PTS || 0)
            t.REB += Number(player.REB || 0)
            t.AST += Number(player.AST || 0)
            t.STL += Number(player.STL || 0)
            t.BLK += Number(player.BLK || 0)
            t.TO += Number(player.TO || 0)
            t.MIN += Number(player.MIN || 0)
            t.FLS += Number(player.FLS || 0)
            t.GAMES++

            const [fgMade, fgAtt] = parseMadeAtt(player.FG)
            const [ftMade, ftAtt] = parseMadeAtt(player.FT)
            const [tpMade, tpAtt] = parseMadeAtt(player["3PT"])

            t.FG_MADE += fgMade
            t.FG_ATT += fgAtt
            t.FT_MADE += ftMade
            t.FT_ATT += ftAtt
            t.TP_MADE += tpMade
            t.TP_ATT += tpAtt
        }

        if (!teamsMap[awayTeam]) teamsMap[awayTeam] = {}
        if (!teamsMap[homeTeam]) teamsMap[homeTeam] = {}

        awayPlayers.forEach((p) => addPlayer(playersMap, p, awayTeam))
        homePlayers.forEach((p) => addPlayer(playersMap, p, homeTeam))
        awayPlayers.forEach((p) => addPlayer(teamsMap[awayTeam], p, awayTeam))
        homePlayers.forEach((p) => addPlayer(teamsMap[homeTeam], p, homeTeam))
    })

    const finalTeams: Record<string, PlayerStats[]> = {}
    for (const team in teamsMap) {
        finalTeams[team] = Object.values(teamsMap[team])
    }

    const finalizePlayer = (p: PlayerStats) => {
        if (p.GAMES > 0) {
            for (const key of ["PTS", "REB", "AST", "STL", "BLK", "TO", "MIN", "FLS"] as const) {
                p[key] = Number((p[key] / p.GAMES).toFixed(1))
            }

            p.FG_MADE = Number((p.FG_MADE / p.GAMES).toFixed(1))
            p.FG_ATT = Number((p.FG_ATT / p.GAMES).toFixed(1))
            p.FT_MADE = Number((p.FT_MADE / p.GAMES).toFixed(1))
            p.FT_ATT = Number((p.FT_ATT / p.GAMES).toFixed(1))
            p.TP_MADE = Number((p.TP_MADE / p.GAMES).toFixed(1))
            p.TP_ATT = Number((p.TP_ATT / p.GAMES).toFixed(1))

            p.FG_PCT = p.FG_ATT > 0 ? Number(((p.FG_MADE / p.FG_ATT) * 100).toFixed(1)) : 0
            p.FT_PCT = p.FT_ATT > 0 ? Number(((p.FT_MADE / p.FT_ATT) * 100).toFixed(1)) : 0
            p.TP_PCT = p.TP_ATT > 0 ? Number(((p.TP_MADE / p.TP_ATT) * 100).toFixed(1)) : 0
        }
    }

    Object.values(playersMap).forEach(finalizePlayer)
    for (const team in finalTeams) {
        finalTeams[team].forEach(finalizePlayer)
    }

    return {
        players: Object.values(playersMap),
        teams: finalTeams
    }
}