export interface VoteResult {
  winningOptionId: string;
  voteCounts: Record<string, number>;
  nextScenarioId: string | null;
  consequence: string;
}