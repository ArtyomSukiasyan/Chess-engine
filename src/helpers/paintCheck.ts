import { ICastlingConditions } from "../models/CastlingConditions";
import { IPiece } from "../models/Piece";
import clearPossibleHighlight from "./clearPossibleHighlight";
import inCheck from "./inCheck";

export default function paintCheck(
  pieces: IPiece[],
  idx: number,
  source: number,
  passantPos: number,
  castlingConditions: ICastlingConditions
) {
  pieces[source].highlight = false;
  pieces = clearPossibleHighlight(pieces);

  const isWhiteInCheck = inCheck("w", pieces, passantPos, castlingConditions);

  if (idx !== source && isWhiteInCheck) {
    for (let j = 0; j < 64; j++) {
      if (pieces[j].ascii === "k") {
        pieces[j].inCheck = true;

        break;
      }
    }
  }

  return pieces;
}
