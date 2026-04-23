const DISABLED_BY_DEFAULT_IDS = new Set(["emoji-confetti", "poop-confetti"]);

export function isAnimationEnabledByDefault(id) {
   return !DISABLED_BY_DEFAULT_IDS.has(id);
}
