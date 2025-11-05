import SeasonStats from "./routes/SeasonStats.svelte";
import Upload from "./routes/upload/Upload.svelte";
import PlayerPage from "./routes/player/PlayerPage.svelte";
import FullStatistics from "./routes/full-statistics/FullStatistics.svelte";
import ComparePlayers from "./routes/compare-players/ComparePlayers.svelte";
import LoginForm from "./components/Login.svelte";
import GamePhotos from "./routes/game-photos/GamePhotos.svelte";

export default {
    "/": SeasonStats,
    "/player/:name": PlayerPage,
    "/full-statistics": FullStatistics,
    "/compare-players": ComparePlayers,
    "/upload": Upload,
    "/game-photos": GamePhotos,
    '/login': LoginForm,
};