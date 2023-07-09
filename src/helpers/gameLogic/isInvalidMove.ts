import { ICastlingConditions } from "../../models/CastlingConditions";
import { EPieceAsciis } from "../../models/enums/PieceAsciis.enum";
import { IPiece } from "../../models/Piece";
import blockersExist from "../board/blockersExist";
import canEnpassant from "./canEnpassant";
import castlingAllowed from "./castlingAllowed";

export default function isInvalidMove(
  start: number,
  end: number,
  pieces: IPiece[],
  statePassantPos: number,
  castlingConditions: ICastlingConditions,
  passant_pos?: number
) {
  const isValidPieces =
    pieces[start].ascii?.toLowerCase() === EPieceAsciis.whiteRook ||
    pieces[start].ascii?.toLowerCase() === EPieceAsciis.whiteQueen ||
    pieces[start].ascii?.toLowerCase() === "b" ||
    pieces[start].ascii?.toLowerCase() === "p" ||
    pieces[start].ascii?.toLowerCase() === EPieceAsciis.whiteKing;

  let invalid = isValidPieces && blockersExist(start, end, pieces);

  if (invalid) {
    return invalid;
  }

  const pawn = pieces[start].ascii?.toLowerCase() === "p";

  invalid =
    pawn && !canEnpassant(start, end, pieces, statePassantPos, passant_pos);

  if (invalid) {
    return invalid;
  }

  const king = pieces[start].ascii?.toLowerCase() === EPieceAsciis.whiteKing;

  if (king && Math.abs(end - start) === 2) {
    invalid = !castlingAllowed(start, end, pieces, castlingConditions);
  }

  return invalid;
}
