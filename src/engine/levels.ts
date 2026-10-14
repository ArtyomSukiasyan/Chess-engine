/** How the bot plays at one difficulty level. */
export interface BotSettings {
  /** How long the bot may think per move. */
  timeLimitMs: number;
  /** Deepest search iteration (in plies). */
  maxDepth: number;
  /** Whether the bot plays known opening lines. */
  useBook: boolean;
  /** Chance (0..1) that the bot plays a random legal move instead of its best one. */
  randomMoveChance: number;
}

export interface BotLevel {
  name: string;
  settings: BotSettings;
}

export const BOT_LEVELS: BotLevel[] = [
  { name: "Beginner", settings: { timeLimitMs: 100, maxDepth: 1, useBook: false, randomMoveChance: 0.3 } },
  { name: "Easy", settings: { timeLimitMs: 200, maxDepth: 2, useBook: true, randomMoveChance: 0.1 } },
  { name: "Medium", settings: { timeLimitMs: 500, maxDepth: 4, useBook: true, randomMoveChance: 0 } },
  { name: "Hard", settings: { timeLimitMs: 1500, maxDepth: 64, useBook: true, randomMoveChance: 0 } },
  { name: "Expert", settings: { timeLimitMs: 4000, maxDepth: 64, useBook: true, randomMoveChance: 0 } },
];

export const DEFAULT_LEVEL = 3;
