import { ICastlingConditions } from "../../models/CastlingConditions";
import { IPiece } from "../../models/Piece";
import isMoveAvailable from "../gameLogic/isMoveAvailable";
import shuffle from "./shuffle";

export default function getMoves(
  pieces: IPiece[],
  passantPos: number,
  castlingConditions: ICastlingConditions,
  botColor: string
) {
  const { starts, ends } = getStartsAndEnds();

  const moves = [];

  for (let i = 0; i < 64; i++) {
    const start = starts[i];

    const isValidPiece = pieces[start].ascii !== null;
    const isBotPiece = isValidPiece && pieces[start].player === botColor;

    if (isBotPiece) {
      for (let j = 0; j < 64; j++) {
        const end = ends[j];
        
        const isAvailableMove = isMoveAvailable(
          start,
          end,
          pieces,
          passantPos,
          castlingConditions
        );

        if (isAvailableMove) {
          moves.push(start);
          moves.push(end);
        }
      }
    }
  }

  return { moves, starts, ends };
}

function getStartsAndEnds() {
  let starts = [];
  let ends = [];

  for (let i = 0; i < 64; i++) {
    starts.push(i);
    ends.push(i);
  }

  starts = shuffle(starts);
  ends = shuffle(ends);

  return { starts, ends };
}
