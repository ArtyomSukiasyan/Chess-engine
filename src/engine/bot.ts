import { bookMove } from "./book";
import { BotSettings } from "./levels";
import { moveToUci } from "./notation";
import { BotPosition, moveFrom, moveTo, Position, to64 } from "./position";
import { search } from "./search";

export interface BotMove {
  /** App square indexes (0 = a8). */
  start: number;
  end: number;
}

/**
 * Picks the bot's move: a book move in the opening, otherwise the best move found within the
 * level's time and depth limits (sometimes a random one on the easier levels).
 * `history` holds the earlier positions of the game, to avoid repetitions.
 */
export function chooseMove(
  current: BotPosition,
  history: BotPosition[],
  settings: BotSettings
): BotMove | null {
  const position = new Position(current, history);
  const move = pickMove(position, settings);
  if (!move) return null;
  return { start: to64(moveFrom(move)), end: to64(moveTo(move)) };
}

/** Like `chooseMove`, but answers in UCI ("e2e4", "e7e8q"), or null when there is no legal move. */
export function chooseUciMove(
  current: BotPosition,
  history: BotPosition[],
  settings: BotSettings
): string | null {
  const position = new Position(current, history);
  const move = pickMove(position, settings);
  return move ? moveToUci(move) : null;
}

function pickMove(position: Position, settings: BotSettings): number {
  const legal = position.legalMoves();
  if (legal.length === 0) return 0;

  let move = 0;
  if (Math.random() < settings.randomMoveChance) {
    move = legal[Math.floor(Math.random() * legal.length)];
  }
  if (!move && settings.useBook) move = bookMove(position);
  if (!move) move = search(position, settings.timeLimitMs, settings.maxDepth).move;
  return move;
}
