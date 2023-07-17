import { ICastlingConditions } from "../../models/CastlingConditions";
import { EPieceAsciis } from "../../models/enums/PieceAsciis.enum";
import { EPlayer } from "../../models/enums/Player.enum";
import { IPiece } from "../../models/Piece";

export default function checkCastlingConditions(
  pieces: IPiece[],
  player: string,
  castlingConditions: ICastlingConditions,
  start: number
) {
  const kingASCII =
    player === EPlayer.white ? EPieceAsciis.whiteKing : EPieceAsciis.blackKing;

  if (pieces[start]?.ascii === kingASCII) {
    if (player === EPlayer.white) {
      castlingConditions = {
        ...castlingConditions,
        whiteKingHasMoved: true,
      };
    } else {
      castlingConditions = {
        ...castlingConditions,
        blackKingHasMoved: true,
      };
    }
  }

  const rookASCII =
    player === EPlayer.white ? EPieceAsciis.whiteRook : EPieceAsciis.blackRook;

  if (pieces[start].ascii === rookASCII) {
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
