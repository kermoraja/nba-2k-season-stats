import SeasonStats from "./routes/SeasonStats.svelte";
import Upload from "./routes/upload/Upload.svelte";
import PlayerPage from "./routes/player/PlayerPage.svelte";

export default {
    "/": SeasonStats,
    "/upload": Upload,
    "/player/:name": PlayerPage,
};