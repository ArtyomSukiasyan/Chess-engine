import { ICastlingConditions } from "../models/CastlingConditions";
import { EPieceAsciis } from "../models/enums/PieceAsciis.enum";
import { EPlayer } from "../models/enums/Player.enum";
import { IPiece } from "../models/Piece";
import {
  BISHOP,
  BLACK,
  BLACK_KING_SIDE,
  BLACK_QUEEN_SIDE,
  BotPosition,
  KING,
  KNIGHT,
  PAWN,
  QUEEN,
  ROOK,
  WHITE,
  WHITE_KING_SIDE,
  WHITE_QUEEN_SIDE,
} from "./position";

/** Piece types by the app's (white, lowercase) ascii; the color comes from `piece.player`. */
const PIECE_TYPES: Record<string, number> = {
  [EPieceAsciis.whitePawn]: PAWN,
  [EPieceAsciis.whiteKnight]: KNIGHT,
  [EPieceAsciis.whiteBishop]: BISHOP,
  [EPieceAsciis.whiteRook]: ROOK,
  [EPieceAsciis.whiteQueen]: QUEEN,
  [EPieceAsciis.whiteKing]: KING,
};

/**
 * Converts the app's game state into the bot's plain position.
 * `passantPos` is the square of a pawn that just made a double step (the app's convention).
 */
export function toBotPosition(
  pieces: IPiece[],
  turn: string,
  castlingConditions: ICastlingConditions,
  passantPos: number
): BotPosition {
  const board = pieces.map((piece) =>
    piece.ascii
      ? (piece.player === EPlayer.white ? WHITE : BLACK) | PIECE_TYPES[piece.ascii.toLowerCase()]
      : 0
  );
  const side = turn === EPlayer.white ? WHITE : BLACK;

  const has = (square: number, code: number) => board[square] === code;
  const whiteKingHome = has(60, WHITE | KING) && !castlingConditions.whiteKingHasMoved;
  const blackKingHome = has(4, BLACK | KING) && !castlingConditions.blackKingHasMoved;

  let castling = 0;
  if (whiteKingHome && has(63, WHITE | ROOK) && !castlingConditions.rightWhiteRookHasMoved) {
    castling |= WHITE_KING_SIDE;
  }
  if (whiteKingHome && has(56, WHITE | ROOK) && !castlingConditions.leftWhiteRookHasMoved) {
    castling |= WHITE_QUEEN_SIDE;
  }
  if (blackKingHome && has(7, BLACK | ROOK) && !castlingConditions.rightBlackRookHasMoved) {
    castling |= BLACK_KING_SIDE;
  }
  if (blackKingHome && has(0, BLACK | ROOK) && !castlingConditions.leftBlackRookHasMoved) {
    castling |= BLACK_QUEEN_SIDE;
  }

  // The capturing pawn lands on the square the enemy pawn passed over.
  let enPassant = -1;
  const enemyPawn = (side ^ BLACK) | PAWN;
  if (passantPos !== -1 && board[passantPos] === enemyPawn) {
    enPassant = passantPos + (side === WHITE ? -8 : 8);
  }

  return { board, side, castling, enPassant };
}
