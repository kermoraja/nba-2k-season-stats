export function getPlayerImage(name: string) {
    const formatted = name.replace(/\./g, "").replace(" ", "-");
    return `/assets/player_images/${formatted}.jpg`;
}

export function handleImageError(event: Event) {
    const img = event.currentTarget as HTMLImageElement;
    if (!img.dataset.fallback) {
        img.dataset.fallback = "true";
        img.src = "/assets/player_images/default.jpg";
    }
}
