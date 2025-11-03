import SeasonStats from "./routes/SeasonStats.svelte";
import Upload from "./routes/upload/Upload.svelte";
import PlayerPage from "./routes/player/PlayerPage.svelte";
import FullStatistics from "./routes/full-statistics/FullStatistics.svelte";
import ComparePlayers from "./routes/compare-players/ComparePlayers.svelte";

export default {
    "/": SeasonStats,
    "/upload": Upload,
    "/player/:name": PlayerPage,
    "/full-statistics": FullStatistics,
    "/compare-players": ComparePlayers
};