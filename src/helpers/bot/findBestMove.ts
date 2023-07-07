import { ICastlingConditions } from "../../models/CastlingConditions";
import { IPiece } from "../../models/Piece";
import makeMove from "../gameLogic/makeMove";
import minimax from "./minimax";

export default function findBestMove(
  moves: number[],
  repetition: number,
  firstPos: number,
  secondPos: number,
  pieces: IPiece[],
  statePassantPos: number,
  depth: number,
  starts: number[],
  ends: number[],
  castlingConditions: ICastlingConditions
) {
  let randStart = 100;
  let randEnd = 100;
  let bestValue = -9999;
  let newRepetition;

  for (let i = 0; i < moves.length; i += 2) {
    let start = moves[i];
    let end = moves[i + 1];

    const isMore2Repetition = moves.length > 2 && repetition >= 2;
    const isSameStart = start === secondPos;
    const isSameEnd = end === firstPos;

    if (isMore2Repetition && isSameStart && isSameEnd) {
      newRepetition = 0;
    } else {
      const testSquares = pieces.slice();

      const testSquares_2 = makeMove(testSquares, start, end, statePassantPos);

      let passantPos = -1;

      const isBlackPawn = testSquares[start].ascii === "P";

      if (isBlackPawn && start >= 8 && start <= 15 && end - start === 16) {
        passantPos = end;
      }

      const boardEval = minimax(
        depth - 1,
        false,
        -1000,
        1000,
        testSquares_2,
        starts,
        ends,
        statePassantPos,
        castlingConditions,
        passantPos
      );

      if (boardEval >= bestValue) {
        bestValue = boardEval;
        randStart = start;
        randEnd = end;
      }
    }
  }

  const isSameStart = randStart === secondPos;
  const isSameEnd = randEnd === firstPos;

  if (isSameStart && isSameEnd) {
    let reps = repetition + 1;
    newRepetition = reps;
  } else {
    newRepetition = 0;
  }

  return { randStart, randEnd, newRepetition };
}
