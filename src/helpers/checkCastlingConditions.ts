import { ICastlingConditions } from "../models/CastlingConditions";
import { IPiece } from "../models/Piece";

export default function checkCastlingConditions(
  pieces: IPiece[],
  player: string,
  castlingConditions: ICastlingConditions,
  start: number
) {
  if (pieces[start].ascii === (player === "w" ? "k" : "K")) {
    if (player === "w") {
      castlingConditions = {
        ...castlingConditions,
        whiteKingHasMoved: true,
      };
    } else {
      castlingConditions = {
        ...castlingConditions,
        whiteKingHasMoved: true,
      };
    }
  }

  if (pieces[start].ascii === (player === "w" ? "r" : "R")) {
    if (start === (player === "w" ? 56 : 0)) {
      if (player === "w") {
        castlingConditions = {
          ...castlingConditions,
          leftWhiteRookHasMoved: true,
        };
      } else {
        castlingConditions = {
          ...castlingConditions,
          leftBlackRookHasMoved: true,
        };
      }
    } else if (start === (player === "w" ? 63 : 7)) {
      if (player === "w") {
        castlingConditions = {
          ...castlingConditions,
          rightWhiteRookHasMoved: true,
        };
      } else {
        castlingConditions = {
          ...castlingConditions,
          rightBlackRookHasMoved: true,
        };
      }
    }
  }

  return castlingConditions;
}
