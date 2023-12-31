import { EPieceAsciis } from "../../models/enums/PieceAsciis.enum";
import { EPlayer } from "../../models/enums/Player.enum";
import { IPiece } from "../../models/Piece";

export default function clearCheckHighlight(pieces: IPiece[], player: string) {
  const kingASCII =
    player === EPlayer.white ? EPieceAsciis.whiteKing : EPieceAsciis.blackKing;

  for (let i = 0; i < 64; i++) {
    if (pieces[i].ascii === kingASCII) {
      pieces[i].inCheck = false;

      break;
    }
  }

  return pieces;
}
