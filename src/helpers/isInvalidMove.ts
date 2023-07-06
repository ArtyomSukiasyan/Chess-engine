import { ICastlingConditions } from "../models/CastlingConditions";
import { IPiece } from "../models/Piece";
import blockersExist from "./blockersExist";
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
    pieces[start].ascii?.toLowerCase() === "r" ||
    pieces[start].ascii?.toLowerCase() === "q" ||
    pieces[start].ascii?.toLowerCase() === "b" ||
    pieces[start].ascii?.toLowerCase() === "p" ||
    pieces[start].ascii?.toLowerCase() === "k";

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

  const king = pieces[start].ascii?.toLowerCase() === "k";

  if (king && Math.abs(end - start) === 2) {
    invalid = !castlingAllowed(start, end, pieces, castlingConditions);
  }

  return invalid;
}
