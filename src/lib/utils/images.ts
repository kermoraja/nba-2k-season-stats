const IMAGE_DB =
    "https://rajakaubad.ee/nba-2k/assets/player-images/";

export function getImageUrl(playerName: string): string {
    if (!playerName) {
        return "/fallback.png";
    }

    const formatted = playerName.replace(/\./g, "").replace(/\s+/g, "-").trim();
    return `${IMAGE_DB}${formatted}.jpg`;
}