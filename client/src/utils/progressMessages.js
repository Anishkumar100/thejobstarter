/*
 * Progress Messages — Motivational messages based on completion percentage.
 * Supports API-fetched custom messages with hardcoded defaults as fallback.
 * Each function accepts an optional `messages` array (from the store/API).
 */

/*
 * Get the first matching message from a list for a given percentage,
 * or return the fallback string if nothing matches.
 * Messages should be pre-filtered by context and sorted by tier ascending.
 */
function findMessage(messages, pct, fallbacks) {
  if (messages && messages.length > 0) {
    const sorted = [...messages].sort((a, b) => a.tier - b.tier);
    const match = sorted.find(m => pct <= m.tier);
    if (match) return match.message;
  }
  if (fallbacks) {
    const flat = Object.entries(fallbacks).sort(([a], [b]) => Number(a) - Number(b));
    const entry = flat.find(([max]) => pct <= Number(max));
    return entry ? entry[1] : flat[flat.length - 1][1];
  }
  return 'Keep going!';
}

const DEFAULT_TIERS = {
  0: "Every expert was once a beginner. Take the first step — your future self will thank you.",
  9: "A strong start. Momentum is building — stay consistent and the results will follow.",
  24: "A quarter of the way there. Small daily wins compound into remarkable progress.",
  49: "Halfway done. You've proven you have the discipline to see this through.",
  74: "Three quarters complete. This level of dedication sets you apart from the crowd.",
  89: "The final stretch. Push through — the finish line is closer than it appears.",
  99: "Nearly there. The final few steps separate the good from the great.",
  100: "Mastered. Every topic you've completed here is a skill that will serve you for life."
};

const DEFAULT_OVERALL = {
  0: "Your learning journey starts now. Every step forward, no matter how small, builds toward mastery.",
  10: "You're off to a solid start. Consistency in these early stages builds the foundation for advanced learning.",
  30: "Steady progress. The habit of daily learning is one of the most valuable skills you can develop.",
  50: "Exceptional progress. You're building knowledge that will set you apart in every interview.",
  75: "Remarkable dedication. You're well on your way to mastering the core computer science fundamentals.",
  99: "Nearly there. The final few steps separate the good from the great — keep pushing.",
  100: "Complete mastery. You've built a comprehensive understanding across all three subjects. Outstanding work."
};

const DEFAULT_CELEBRATION = {
  100: "Excellent work. Each completed topic brings you closer to your goals."
};

export function getMotivationalMessage(pct, messages) {
  const perSubject = messages ? messages.filter(m => m.context === 'per-subject') : null;
  const msg = findMessage(perSubject, pct, DEFAULT_TIERS);
  const fallbackTier = Object.keys(DEFAULT_TIERS).find(t => pct <= Number(t));
  return { message: msg, tier: Number(fallbackTier) || 100 };
}

export function getOverallMessage(pct, messages) {
  const overall = messages ? messages.filter(m => m.context === 'overall') : null;
  return findMessage(overall, pct, DEFAULT_OVERALL);
}

export function getStreakMessage(completedToday, messages) {
  const streak = messages ? messages.filter(m => m.context === 'streak') : null;
  if (streak && streak.length > 0) {
    const sorted = [...streak].sort((a, b) => a.tier - b.tier);
    const match = sorted.find(m => completedToday <= m.tier);
    if (match) return match.message;
  }
  /* Hardcoded streak fallback */
  if (completedToday === 0) return "Nothing marked today. Even a single topic tomorrow will keep your momentum alive.";
  if (completedToday === 1) return "1 item completed today. Consistency is the foundation of mastery — stay the course.";
  if (completedToday <= 3) return `${completedToday} items completed today. Strong discipline and focus — keep this momentum going.`;
  return `${completedToday} items completed today. Outstanding effort — this level of dedication builds true expertise.`;
}

export function getCelebrationMessage(pct, messages) {
  const celebrations = messages ? messages.filter(m => m.context === 'celebration') : null;
  return findMessage(celebrations, pct, DEFAULT_CELEBRATION);
}

export const DEFAULT_MESSAGES = DEFAULT_TIERS;
