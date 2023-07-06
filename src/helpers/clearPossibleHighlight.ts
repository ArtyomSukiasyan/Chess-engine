import { IPiece } from "../models/Piece";

export default function clearPossibleHighlight(pieces: IPiece[]) {
  for (let i = 0; i < 64; i++) {
    if (pieces[i].possible) {
      pieces[i].possible = false;
    }
  }

  return pieces;
}
