import { ICastlingConditions } from "../../models/CastlingConditions";
import { EPlayer } from "../../models/enums/Player.enum";
import { IPiece } from "../../models/Piece";
import clearCheckHighlight from "./clearCheckHighlight";
import clearPossibleHighlight from "./clearPossibleHighlight";
import isMoveAvailable from "../isMoveAvailable";

export default function paintPossibleMoves(
  pieces: IPiece[],
  idx: number,
  passantPos: number,
  castlingConditions: ICastlingConditions
) {
  pieces = clearCheckHighlight(pieces, EPlayer.white).slice();
  pieces = clearPossibleHighlight(pieces);

  pieces[idx].highlight = true;

  for (let j = 0; j < 64; j++) {
    if (isMoveAvailable(idx, j, pieces, passantPos, castlingConditions))
      pieces[j].possible = true;
  }

  return pieces;
}
