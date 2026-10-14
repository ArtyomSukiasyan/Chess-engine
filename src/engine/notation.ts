import {
  BISHOP,
  BLACK,
  BLACK_KING_SIDE,
  BLACK_QUEEN_SIDE,
  BotPosition,
  FLAG_PROMOTION,
  KING,
  KNIGHT,
  moveFlags,
  moveFrom,
  moveTo,
  PAWN,
  Position,
  QUEEN,
  ROOK,
  to0x88,
  to64,
  WHITE,
  WHITE_KING_SIDE,
  WHITE_QUEEN_SIDE,
} from "./position";

/** Conversions between the bot's positions and moves and standard chess notation (FEN, UCI). */

export const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

const FILES = "abcdefgh";
const PIECE_TYPES: Record<string, number> = { p: PAWN, n: KNIGHT, b: BISHOP, r: ROOK, q: QUEEN, k: KING };
const CASTLING_RIGHTS: Record<string, number> = {
  K: WHITE_KING_SIDE,
  Q: WHITE_QUEEN_SIDE,
  k: BLACK_KING_SIDE,
  q: BLACK_QUEEN_SIDE,
};

/** "e4" -> square index 0..63 (0 = a8). */
export const parseSquare = (name: string) => (8 - Number(name[1])) * 8 + FILES.indexOf(name[0]);

/** Square index 0..63 -> "e4". */
export const squareName = (sq: number) => FILES[sq & 7] + (8 - (sq >> 3));

export function fromFen(fen: string): BotPosition {
  const [placement, side, castling, enPassant] = fen.trim().split(/\s+/);
  const board: number[] = [];
  for (const char of placement.replace(/\//g, "")) {
    if (/\d/.test(char)) board.push(...Array(Number(char)).fill(0));
    else board.push((char === char.toLowerCase() ? BLACK : WHITE) | PIECE_TYPES[char.toLowerCase()]);
  }
  return {
    board,
    side: side === "b" ? BLACK : WHITE,
    castling: [...(castling ?? "-")].reduce((bits, c) => bits | (CASTLING_RIGHTS[c] ?? 0), 0),
    enPassant: !enPassant || enPassant === "-" ? -1 : parseSquare(enPassant),
  };
}

export const startPosition = () => fromFen(START_FEN);

/** Bot move -> UCI ("e2e4", "e7e8q"). The bot always promotes to a queen. */
export function moveToUci(move: number): string {
  const promotion = moveFlags(move) & FLAG_PROMOTION ? "q" : "";
  return squareName(to64(moveFrom(move))) + squareName(to64(moveTo(move))) + promotion;
}

/** The legal move matching a UCI string, or 0. The promotion piece is ignored. */
export function findUciMove(position: Position, uci: string): number {
  const from = to0x88(parseSquare(uci.slice(0, 2)));
  const to = to0x88(parseSquare(uci.slice(2, 4)));
  return position.legalMoves().find((m) => moveFrom(m) === from && moveTo(m) === to) ?? 0;
}
