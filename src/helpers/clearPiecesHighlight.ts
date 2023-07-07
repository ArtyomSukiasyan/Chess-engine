import { IPiece } from "../models/Piece";
import clearHighlight from "./clearHighlight";
import clearPossibleHighlight from "./clearPossibleHighlight";

export default function clearPiecesHighLight(pieces: IPiece[], player: string) {
  pieces = clearHighlight(pieces);

  if (player === "w") {
    pieces = clearPossibleHighlight(pieces);

    for (let j = 0; j < 64; j++) {
      if (pieces[j].ascii === "k") {
        pieces[j].inCheck = false;

        break;
      }
    }
  }

  return pieces;
}
