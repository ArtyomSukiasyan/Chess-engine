import { bookMove } from "./book";
import { BotPosition, moveFrom, moveTo, Position, to64 } from "./position";
import { search } from "./search";

export interface BotMove {
  /** App square indexes (0 = a8). */
  start: number;
  end: number;
}

/**
 * Picks the bot's move: a book move in the opening, otherwise the best move found within
 * `timeLimitMs`. `history` holds the earlier positions of the game, to avoid repetitions.
 */
export function chooseMove(
  current: BotPosition,
  history: BotPosition[],
  timeLimitMs: number
): BotMove | null {
  const position = new Position(current, history);
  const move = bookMove(position) || search(position, timeLimitMs).move;
  if (!move) return null;
  return { start: to64(moveFrom(move)), end: to64(moveTo(move)) };
}
