import { ICastlingConditions } from "../models/CastlingConditions";
import { EPlayer } from "../models/enums/Player.enum";
import { IPiece } from "../models/Piece";

export default function checkCastlingConditions(
  pieces: IPiece[],
  player: string,
  castlingConditions: ICastlingConditions,
  start: number
) {
  if (pieces[start]?.ascii === (player === EPlayer.white ? "k" : "K")) {
    if (player === EPlayer.white) {
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

  if (pieces[start].ascii === (player === EPlayer.white ? "r" : "R")) {
    if (start === (player === EPlayer.white ? 56 : 0)) {
      if (player === EPlayer.white) {
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
    } else if (start === (player === EPlayer.white ? 63 : 7)) {
      if (player === EPlayer.white) {
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
