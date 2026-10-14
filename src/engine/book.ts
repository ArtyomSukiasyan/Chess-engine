import { findUciMove, startPosition } from "./notation";
import { Position } from "./position";

/**
 * A few main lines, so the bot opens like a chess player instead of hopping with a knight.
 * Positions are matched by hash, so transpositions into these lines also use the book.
 */
const LINES = [
  "e2e4 e7e5 g1f3 b8c6 f1b5 a7a6 b5a4 g8f6 e1g1 f8e7", // Ruy Lopez
  "e2e4 e7e5 g1f3 b8c6 f1c4 f8c5 c2c3 g8f6 d2d3 d7d6", // Italian
  "e2e4 e7e5 g1f3 b8c6 d2d4 e5d4 f3d4 g8f6 d4c6 b7c6", // Scotch
  "e2e4 e7e5 g1f3 g8f6 f3e5 d7d6 e5f3 f6e4 d2d4 d6d5 f1d3 b8c6", // Petrov, classical
  "e2e4 e7e5 g1f3 g8f6 d2d4 f6e4 f1d3 d7d5 f3e5 b8d7", // Petrov, 3.d4
  "e2e4 c7c5 g1f3 d7d6 d2d4 c5d4 f3d4 g8f6 b1c3 a7a6", // Sicilian Najdorf
  "e2e4 c7c5 g1f3 b8c6 d2d4 c5d4 f3d4 g8f6 b1c3 e7e5", // Sicilian Sveshnikov
  "e2e4 c7c5 b1c3 b8c6 g2g3 g7g6 f1g2 f8g7 d2d3 d7d6", // Closed Sicilian
  "e2e4 e7e6 d2d4 d7d5 b1c3 g8f6 c1g5 f8e7 e4e5 f6d7", // French
  "e2e4 c7c6 d2d4 d7d5 b1c3 d5e4 c3e4 c8f5 e4g3 f5g6", // Caro-Kann
  "e2e4 d7d5 e4d5 d8d5 b1c3 d5a5 d2d4 g8f6 g1f3 c8f5", // Scandinavian
  "d2d4 d7d5 c2c4 e7e6 b1c3 g8f6 c1g5 f8e7 e2e3 e8g8", // Queen's Gambit Declined
  "d2d4 d7d5 c2c4 c7c6 g1f3 g8f6 b1c3 d5c4 a2a4 c8f5", // Slav
  "d2d4 d7d5 g1f3 g8f6 c1f4 e7e6 e2e3 c7c5 c2c3 b8c6", // London
  "d2d4 g8f6 c2c4 g7g6 b1c3 f8g7 e2e4 d7d6 g1f3 e8g8", // King's Indian
  "d2d4 g8f6 c2c4 e7e6 b1c3 f8b4 e2e3 e8g8 f1d3 d7d5", // Nimzo-Indian
  "c2c4 e7e5 b1c3 g8f6 g1f3 b8c6 g2g3 d7d5 c4d5 f6d5", // English
];

/**
 * The bot's own repertoire: in these positions it always plays the given move instead of a
 * random book move. Keys are the moves leading to the position. The other book lines are
 * still used when the bot plays the other side.
 */
const MAIN_REPLIES: Record<string, string> = {
  e2e4: "e7e5", // 1.e4 e5
  "e2e4 e7e5 g1f3": "g8f6", // 2.Nf3 Nf6, the Petrov
};

const keyOf = (position: Position) => `${position.hashLo}:${position.hashHi}`;

let book: Map<string, number[]> | null = null;
let mainReplies: Map<string, number> | null = null;

/** Maps each book position (by hash) to its book moves. Exported for tests. */
export function buildBook(): Map<string, number[]> {
  const result = new Map<string, number[]>();
  for (const line of LINES) {
    const position = new Position(startPosition());
    for (const uci of line.split(" ")) {
      const move = findUciMove(position, uci);
      if (!move) throw new Error(`Illegal book move ${uci} in "${line}"`);

      const key = keyOf(position);
      const moves = result.get(key) ?? [];
      if (!moves.includes(move)) moves.push(move);
      result.set(key, moves);
      position.make(move);
    }
  }
  return result;
}

/** Maps each repertoire position (by hash) to the bot's move there. Exported for tests. */
export function buildMainReplies(): Map<string, number> {
  const result = new Map<string, number>();
  for (const [line, reply] of Object.entries(MAIN_REPLIES)) {
    const position = new Position(startPosition());
    for (const uci of line.split(" ")) {
      const move = findUciMove(position, uci);
      if (!move) throw new Error(`Illegal repertoire move ${uci} in "${line}"`);
      position.make(move);
    }
    const move = findUciMove(position, reply);
    if (!move) throw new Error(`Illegal repertoire reply ${reply} after "${line}"`);
    result.set(keyOf(position), move);
  }
  return result;
}

/** The repertoire move, else a random book move for this position, or 0 when out of book. */
export function bookMove(position: Position): number {
  mainReplies ??= buildMainReplies();
  const main = mainReplies.get(keyOf(position));
  if (main) return main;

  book ??= buildBook();
  const moves = book.get(keyOf(position));
  return moves ? moves[Math.floor(Math.random() * moves.length)] : 0;
}
