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
  castlingConditions: ICastlingConditions,
  humanColor: string
) {
  pieces[source].highlight = false;
  pieces = clearPossibleHighlight(pieces);

  const isHumanInCheck = inCheck(humanColor, pieces, passantPos, castlingConditions);
  const kingASCII =
    humanColor === EPlayer.white ? EPieceAsciis.whiteKing : EPieceAsciis.blackKing;

  if (idx !== source && isHumanInCheck) {
    for (let j = 0; j < 64; j++) {
      if (pieces[j].ascii === kingASCII) {
        pieces[j].inCheck = true;

        break;
      }
    }
  }

  return pieces;
}
