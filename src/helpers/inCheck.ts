import { ICastlingConditions } from "../models/CastlingConditions";
import { IPiece } from "../models/Piece";
import isInvalidMove from "./isInvalidMove";

export default function inCheck(
  player: string,
  pieces: IPiece[],
  statePassantPos: number,
  castlingConditions: ICastlingConditions
) {
  const king = player === "w" ? "k" : "K";
  let positionOfKing = -1;

  for (let i = 0; i < 64; i++) {
    if (pieces[i].ascii === king) {
      positionOfKing = i;
      break;
    }
  }

  for (let i = 0; i < 64; i++) {
    if (pieces[i].player !== player) {
      if (
        pieces[i].canMove(i, positionOfKing) &&
        !isInvalidMove(
          i,
          positionOfKing,
          pieces,
          statePassantPos,
          castlingConditions
        )
      ) {
        return true;
      }
    }
  }

  return false;
}
