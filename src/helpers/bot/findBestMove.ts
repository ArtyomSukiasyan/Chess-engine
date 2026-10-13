import { ICastlingConditions } from "../../models/CastlingConditions";
import { EPieceAsciis } from "../../models/enums/PieceAsciis.enum";
import { EPlayer } from "../../models/enums/Player.enum";
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
  castlingConditions: ICastlingConditions,
  botColor: string
) {
  let randStart = 100;
  let randEnd = 100;
  let bestValue = -9999;
  let newRepetition: number;

  for (let i = 0; i < moves.length; i += 2) {
    let start = moves[i];
    let end = moves[i + 1];

    const isMore2Repetition = moves.length > 2 && repetition >= 2;
    const isSameStart = start === secondPos;
    const isSameEnd = end === firstPos;

    if (isMore2Repetition && isSameStart && isSameEnd) {
      newRepetition = 0;

      break;
    }

    const testSquares = pieces.slice();

    const testSquares_2 = makeMove(testSquares, start, end, statePassantPos);

    let passantPos = -1;

    // makeMove mutates testSquares, so the moved piece is now on `end`.
    const isBlack = botColor === EPlayer.black;
    const botPawn = isBlack ? EPieceAsciis.blackPawn : EPieceAsciis.whitePawn;
    const isBotPawn = testSquares[end].ascii === botPawn;
    const pawnRowStart = isBlack ? 8 : 48;
    const isPawnStart = start >= pawnRowStart && start <= pawnRowStart + 7;
    const isPawnJump = end - start === (isBlack ? 16 : -16);

    if (isBotPawn && isPawnStart && isPawnJump) {
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
      passantPos,
      botColor
    );

    if (boardEval >= bestValue) {
      bestValue = boardEval;
      randStart = start;
      randEnd = end;
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
