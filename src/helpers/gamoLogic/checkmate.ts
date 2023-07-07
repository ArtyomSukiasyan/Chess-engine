import { ICastlingConditions } from "../../models/CastlingConditions";
import { IPiece } from "../../models/Piece";
import inCheck from "./inCheck";
import isMoveAvailable from "./isMoveAvailable";

export default function checkmate(
  player: string,
  pieces: IPiece[],
  statePassantPos: number,
  castlingConditions: ICastlingConditions
) {
  if (!inCheck(player, pieces, statePassantPos, castlingConditions)) {
    return false;
  }

  for (let i = 0; i < 64; i++) {
    if (pieces[i].player === player) {
      for (let j = 0; j < 64; j++) {
        if (
          isMoveAvailable(i, j, pieces, statePassantPos, castlingConditions)
        ) {
          return false;
        }
      }
    }
  }

  return true;
}
