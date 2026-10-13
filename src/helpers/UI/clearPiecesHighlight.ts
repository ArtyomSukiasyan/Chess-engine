import { EPieceAsciis } from "../../models/enums/PieceAsciis.enum";
import { EPlayer } from "../../models/enums/Player.enum";
import { IPiece } from "../../models/Piece";
import clearHighlight from "./clearHighlight";
import clearPossibleHighlight from "./clearPossibleHighlight";

export default function clearPiecesHighLight(
  pieces: IPiece[],
  player: string,
  humanColor: string
) {
  pieces = clearHighlight(pieces);

  if (player === humanColor) {
    const kingASCII =
      humanColor === EPlayer.white
        ? EPieceAsciis.whiteKing
        : EPieceAsciis.blackKing;

    pieces = clearPossibleHighlight(pieces);

    for (let j = 0; j < 64; j++) {
      if (pieces[j].ascii === kingASCII) {
        pieces[j].inCheck = false;

        break;
      }
    }
  }

  return pieces;
}
