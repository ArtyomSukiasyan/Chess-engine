import { ICastlingConditions } from "../../models/CastlingConditions";
import { IPiece } from "../../models/Piece";
import isMoveAvailable from "./isMoveAvailable";

/** All legal moves of `player`, flattened as [start1, end1, start2, end2, ...]. */
export default function getMoves(
  pieces: IPiece[],
  passantPos: number,
  castlingConditions: ICastlingConditions,
  player: string
) {
  const moves: number[] = [];

  for (let start = 0; start < 64; start++) {
    if (pieces[start].ascii === null || pieces[start].player !== player) {
      continue;
    }

    for (let end = 0; end < 64; end++) {
      if (isMoveAvailable(start, end, pieces, passantPos, castlingConditions)) {
        moves.push(start, end);
      }
    }
  }

  return moves;
}
