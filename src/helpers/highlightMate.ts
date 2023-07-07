import { EPlayer } from "../models/enums/Player.enum";
import { IPiece } from "../models/Piece";

export default function highlightMate(
  player: string,
  pieces: IPiece[],
  checkMated: boolean,
  staleMated: boolean
) {
  if (checkMated || staleMated) {
    const playerASCII = player === EPlayer.white ? "k" : "K";

    for (let j = 0; j < 64; j++) {
      if (pieces[j].ascii === playerASCII) {
        pieces[j].checked = checkMated;
        
        break;
      }
    }
  }
  return pieces;
}
