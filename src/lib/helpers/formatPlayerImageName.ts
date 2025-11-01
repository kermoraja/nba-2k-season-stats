export function formatPlayerImageName(name: string): string {
    if (!name) return "default_player";

    return name
        .trim()
        .replace(/\./g, "")
        .replace(/\s+/g, "-")
        .replace(/--+/g, "-")
        .replace(/[^A-Za-z0-9\-]/g, "");
}