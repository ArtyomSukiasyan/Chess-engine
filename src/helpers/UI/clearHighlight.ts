import { IPiece } from "../../models/Piece";

export default function clearHighlight(pieces: IPiece[]) {
  for (let i = 0; i < 64; i++) {
    if (pieces[i].highlight) {
      pieces[i].highlight = false;
    }
  }

  return pieces;
}
