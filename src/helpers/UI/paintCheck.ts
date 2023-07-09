import { ICastlingConditions } from "../../models/CastlingConditions";
import { EPlayer } from "../../models/enums/Player.enum";
import { IPiece } from "../../models/Piece";
import clearPossibleHighlight from "./clearPossibleHighlight";
import inCheck from "../gameLogic/inCheck";
import { EPieceAsciis } from "../../models/enums/PieceAsciis.enum";

export default function paintCheck(
  pieces: IPiece[],
  idx: number,
  source: number,
  passantPos: number,
  castlingConditions: ICastlingConditions
) {
  pieces[source].highlight = false;
  pieces = clearPossibleHighlight(pieces);

  const isWhiteInCheck = inCheck(EPlayer.white, pieces, passantPos, castlingConditions);

  if (idx !== source && isWhiteInCheck) {
    for (let j = 0; j < 64; j++) {
      if (pieces[j].ascii === EPieceAsciis.whiteKing) {
        pieces[j].inCheck = true;

        break;
      }
    }
  }

  return pieces;
}
