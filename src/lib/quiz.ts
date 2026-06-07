// Quiz scoring helpers — shared between QuizModule (client) and the OG card route (server)

export const TOTAL = 10

// Score → rank tier (0-based). Matches quiz.ranks / quiz.rank_descs order in messages.
export function rankIndex(score: number): number {
  if (score <= 4) return 0
  if (score <= 7) return 1
  if (score <= 9) return 2
  return 3
}
