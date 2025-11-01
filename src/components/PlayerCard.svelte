<script lang="ts">
    import type { PlayerStats } from "../lib/services/statsService";
    import { formatPlayerImageName } from "../lib/helpers/formatPlayerImageName";
    import { getImageUrl } from "../lib/utils/images";

    export let player: PlayerStats;
    export let selectedStat = "PTS";

    const formattedName = formatPlayerImageName(player.NAME);
    const imagePath = getImageUrl(player.NAME);
    const defaultImage = getImageUrl('default_player');

    const getValue = (v: any) => (v !== undefined && v !== null ? v : "-");

    const formatFG = () =>
        player.FG_ATT > 0 ? `${player.FG_MADE}-${player.FG_ATT} (${player.FG_PCT}%)` : "-";

    const formatFT = () =>
        player.FT_ATT > 0 ? `${player.FT_MADE}-${player.FT_ATT} (${player.FT_PCT}%)` : "-";

    const format3PT = () =>
        player.TP_ATT > 0 ? `${player.TP_MADE}-${player.TP_ATT} (${player.TP_PCT}%)` : "-";

    const onImgError = (e: Event) => {
        const img = e.currentTarget as HTMLImageElement;
        if (img.dataset.fallback !== "1") {
            img.dataset.fallback = "1";
            img.src = defaultImage;
        }
    };
</script>

<div class="player-card">
    <img
            class="player-img"
            src={imagePath}
            alt={player.NAME}
            on:error={onImgError}
    />

    <div class="header">
        <h3>{player.NAME}</h3>
        <p class="highlight">{selectedStat}: {getValue(player[selectedStat])}</p>
    </div>

    <div class="stats">
        <div><strong>FG:</strong> {formatFG()}</div>
        <div><strong>FT:</strong> {formatFT()}</div>
        <div><strong>3PT:</strong> {format3PT()}</div>
    </div>

    <div class="extras">
        <span>REB: {player.REB}</span>
        <span>AST: {player.AST}</span>
        <span>STL: {player.STL}</span>
    </div>
</div>

<style>
    .player-card {
        position: relative;
        background: linear-gradient(180deg, #001045 0%, #000536 100%);
        border-radius: 1rem;
        padding: 1rem;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        overflow: hidden;
        transition: transform 0.2s ease;
    }
    .player-card:hover {
        transform: translateY(-4px);
    }

    /* Pilt väikese overlay-na paremas ülanurgas */
    .player-img {
        position: absolute;
        top: 0.4rem;
        right: 0.4rem;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        object-fit: cover;
        opacity: 0.4;
        pointer-events: none;
    }

    .header {
        margin-bottom: 0.4rem;
        z-index: 1;
    }
    .header h3 {
        margin: 0;
        font-size: 1rem;
        font-weight: 600;
    }
    .highlight {
        color: #ffd700;
        font-weight: bold;
        font-size: 1.1rem;
    }
    .stats {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
        font-size: 0.85rem;
        color: #c0d8ff;
        z-index: 1;
    }
    .extras {
        display: flex;
        justify-content: space-between;
        font-size: 0.8rem;
        margin-top: 0.4rem;
        opacity: 0.9;
        z-index: 1;
    }
</style>
