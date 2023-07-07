import { ICastlingConditions } from "../models/CastlingConditions";
import { IPiece } from "../models/Piece";
import isMoveAvailable from "./isMoveAvailable";
import shuffle from "./shuffle";

export default function getMoves(
  pieces: IPiece[],
  passantPos: number,
  castlingConditions: ICastlingConditions
) {
  let starts = [];
  let ends = [];

  for (let i = 0; i < 64; i++) {
    starts.push(i);
    ends.push(i);
  }

  starts = shuffle(starts);
  ends = shuffle(ends);

  let moves = [];
  for (let i = 0; i < 64; i++) {
    let start = starts[i];
    let isBlackPiece =
      pieces[start].ascii !== null && pieces[start].player === "b";
    if (isBlackPiece) {
      for (let j = 0; j < 64; j++) {
        let end = ends[j];
        if (
          isMoveAvailable(start, end, pieces, passantPos, castlingConditions)
        ) {
          moves.push(start);
          moves.push(end);
        }
      }
    }
  }

  return { moves, starts, ends };
}
