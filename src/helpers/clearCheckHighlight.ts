import { IPiece } from "../models/Piece";

export default function clearCheckHighlight(pieces: IPiece[], player: string) {
  const kingASCII = player === "w" ? "k" : "K";

  for (let i = 0; i < 64; i++) {
    if (pieces[i].ascii === kingASCII) {
      pieces[i].inCheck = false;

      break;
    }
  }

  return pieces;
}
