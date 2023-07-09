import { ICastlingConditions } from "../../models/CastlingConditions";
import { EPlayer } from "../../models/enums/Player.enum";
import { IPiece } from "../../models/Piece";
import evaluateBlack from "./evaluateBlack";
import isMoveAvailable from "../gameLogic/isMoveAvailable";
import makeMove from "../gameLogic/makeMove";

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
    const start = starts[i];

    const isValidPiece = copySquares[start].ascii !== null;
    const currentPlayer = isBlackPlayer ? EPlayer.black : EPlayer.white;
    const isSamePlayer = copySquares[start].player === currentPlayer;

    const isPlayerPiece = isValidPiece && isSamePlayer;

    if (isPlayerPiece) {
      for (let j = 0; j < 64; j++) {
        const end = ends[j];
        const isAvailableMove = isMoveAvailable(
          start,
          end,
          copySquares,
          statePassantPos,
          castlingConditions,
          passantPos
        );

        if (isAvailableMove) {
          const testSquares = pieces.slice();
          const testSquares2 = makeMove(
            testSquares,
            start,
            end,
            statePassantPos,
            passantPos
          );

          let passant = -1;

          const playerASCII = isBlackPlayer ? "P" : "p";
          const isSamePlayer = testSquares[end].ascii === playerASCII;

          const pawnJumpValue = isBlackPlayer ? 16 : -16;
          const pawnMovesCount = end - start;
          const isOpponentPawnHasJumped = pawnMovesCount === pawnJumpValue;

          const isPawnValidStart = start >= (isBlackPlayer ? 8 : 48);
          const isPawnValidEnd = start <= (isBlackPlayer ? 15 : 55);
          const isValidPawnPosition = isPawnValidStart && isPawnValidEnd;

          const isBlackCanEnpassant =
            isValidPawnPosition && isOpponentPawnHasJumped;

          if (isSamePlayer && isBlackCanEnpassant) {
            passant = end;
          }

          let value = minimax(
            depth - 1,
            !isBlackPlayer,
            alpha,
            beta,
            testSquares2,
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
