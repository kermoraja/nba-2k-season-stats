<script lang="ts">
    import type { PlayerStats } from "../lib/services/statsService"
    import { getImageUrl } from "../lib/utils/images"

    export let player: PlayerStats
    export let selectedStat = "PTS"

    const imagePath = getImageUrl(player.NAME)
    const defaultImage = getImageUrl("default_player")

    const teamColors: Record<string, string> = {
        HAWKS: "linear-gradient(180deg, rgba(139,30,63,0.9) 0%, rgba(58,14,30,0.95) 100%)",
        JAZZ: "linear-gradient(180deg, rgba(12,35,64,0.9) 0%, rgba(29,41,81,0.95) 100%)",
        LAKERS: "linear-gradient(180deg, rgba(85,37,131,0.9) 0%, rgba(253,185,39,0.95) 100%)",
        CELTICS: "linear-gradient(180deg, rgba(0,122,51,0.9) 0%, rgba(0,71,27,0.95) 100%)",
        HEAT: "linear-gradient(180deg, rgba(152,0,46,0.9) 0%, rgba(0,0,0,0.95) 100%)",
        DEFAULT: "linear-gradient(180deg, rgba(0,16,69,0.9) 0%, rgba(0,5,54,0.95) 100%)"
    }

    const bgStyle = teamColors[player.TEAM] || teamColors.DEFAULT

    const onImgError = (e: Event) => {
        const img = e.currentTarget as HTMLImageElement
        if (img.dataset.fallback !== "1") {
            img.dataset.fallback = "1"
            img.src = defaultImage
        }
    }
</script>

<div
        class="relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl shadow-lg overflow-hidden transition-transform duration-300 hover:-translate-y-1"
        style="background: {bgStyle};"
>
    <img
            src={imagePath}
            alt={player.NAME}
            class="absolute top-3 right-3 w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover opacity-90 pointer-events-none"
            on:error={onImgError}
    />

    <div class="z-10">
        <h3 class="text-lg sm:text-xl font-semibold mb-1">{player.NAME}</h3>
        <p class="text-yellow-400 text-base sm:text-lg font-bold mb-3">
            {selectedStat}: {player[selectedStat] ?? "-"}
        </p>
    </div>

    <div class="text-sm text-gray-200 flex flex-col gap-1">
        <div><span class="text-gray-300 font-medium">FG:</span> {player.FG_MADE}-{player.FG_ATT} ({player.FG_PCT}%)</div>
        <div><span class="text-gray-300 font-medium">FT:</span> {player.FT_MADE}-{player.FT_ATT} ({player.FT_PCT}%)</div>
        <div><span class="text-gray-300 font-medium">3PT:</span> {player.TP_MADE}-{player.TP_ATT} ({player.TP_PCT}%)</div>
    </div>

    <div class="flex justify-between text-xs sm:text-sm text-gray-300 mt-3">
        <span>REB: {player.REB}</span>
        <span>AST: {player.AST}</span>
        <span>STL: {player.STL}</span>
    </div>
</div>
