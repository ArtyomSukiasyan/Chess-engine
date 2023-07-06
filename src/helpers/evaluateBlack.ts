import { IPiece } from "../models/Piece";
import getPieceValue from "./getPieceValue";

export default function evaluateBlack(pieces: IPiece[]) {
  let totalEval = 0;

  for (let i = 0; i < 64; i++) {
    totalEval += getPieceValue(pieces[i], i);
  }

  return totalEval;
}
