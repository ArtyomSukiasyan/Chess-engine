import { ICastlingConditions } from "../models/CastlingConditions";
import { EPlayer } from "../models/enums/Player.enum";
import { IPiece } from "../models/Piece";
import evaluateBlack from "./evaluateBlack";
import isMoveAvailable from "./isMoveAvailable";
import makeMove from "./makeMove";

export default function minimax(
  depth: number,
  isBlackPlayer: boolean,
  alpha: number,
  beta: number,
  pieces: IPiece[],
  starts: number[],
  ends: number[],
  statePassantPos: number,
  castlingConditions: ICastlingConditions,
  passantPos: number
) {
  const copySquares = pieces.slice();
  if (depth === 0) {
    return evaluateBlack(copySquares);
  }

  let bestValue = isBlackPlayer ? -9999 : 9999;

  for (let i = 0; i < 64; i++) {
    let start = starts[i];
    let isPlayerPiece =
      copySquares[start].ascii !== null &&
      copySquares[start].player === (isBlackPlayer ? EPlayer.black : EPlayer.white);

    if (isPlayerPiece) {
      for (let j = 0; j < 64; j++) {
        let end = ends[j];
        if (
          isMoveAvailable(
            start,
            end,
            copySquares,
            statePassantPos,
            castlingConditions,
            passantPos
          )
        ) {
          const testSquares = pieces.slice();
          const testSquares_2 = makeMove(
            testSquares,
            start,
            end,
            statePassantPos,
            passantPos
          );
          let passant = -1;
          if (
            testSquares[end].ascii === (isBlackPlayer ? "P" : "p") &&
            start >= (isBlackPlayer ? 8 : 48) &&
            start <= (isBlackPlayer ? 15 : 55) &&
            end - start === (isBlackPlayer ? 16 : -16)
          ) {
            passant = end;
          }

          let value = minimax(
            depth - 1,
            !isBlackPlayer,
            alpha,
            beta,
            testSquares_2,
            starts,
            ends,
            statePassantPos,
            castlingConditions,
            passant
          );
          if (isBlackPlayer) {
            if (value > bestValue) {
              bestValue = value;
            }
            alpha = Math.max(alpha, bestValue);

            if (bestValue >= beta) {
              return bestValue;
            }
          } else {
            if (value < bestValue) {
              bestValue = value;
            }

            beta = Math.min(beta, bestValue);

            if (bestValue <= alpha) {
              return bestValue;
            }
          }
        }
      }
    }
  }

  return bestValue;
}
