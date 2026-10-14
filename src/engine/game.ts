import { findUciMove, fromFen, startPosition } from "./notation";
import { BISHOP, BotPosition, KNIGHT, moveTo, Position, QUEEN, ROOK, to64 } from "./position";

const PROMOTION_TYPES: Record<string, number> = { n: KNIGHT, b: BISHOP, r: ROOK, q: QUEEN };

/**
 * Replays a game given as UCI moves (as online servers send it) and returns every position:
 * the starting one first, the current one last. Throws on an illegal move.
 *
 * The search only promotes to queens, so an opponent's underpromotion is patched into the
 * position after the move.
 */
export function replayGame(uciMoves: string[], initialFen?: string): BotPosition[] {
  const start = !initialFen || initialFen === "startpos" ? startPosition() : fromFen(initialFen);
  const positions = [start];

  for (const uci of uciMoves) {
    const position = new Position(positions[positions.length - 1]);
    const move = findUciMove(position, uci);
    if (!move || !position.make(move)) throw new Error(`Illegal move ${uci}`);

    const next = position.snapshot();
    const promotion = PROMOTION_TYPES[uci[4]];
    if (promotion) {
      const square = to64(moveTo(move));
      next.board[square] = (next.board[square] & ~7) | promotion;
    }
    positions.push(next);
  }
  return positions;
}
