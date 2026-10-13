import { IPiece } from "../../models/Piece";
import calcSquareColor from "./calcSquareColor";

export default function getSquareClasses(
  i: number,
  j: number,
  pieces: IPiece[],
  isBotRunning: boolean,
  mated: boolean,
  humanColor: string
) {
  let squareColor = calcSquareColor(i, j, pieces);
  let squareCursor = "pointer";

  if (pieces[i * 8 + j].player !== humanColor) {
    squareCursor = "default";
  }

  if (isBotRunning && !mated) {
    squareCursor = "isBotRunning";
  }

  if (mated) {
    squareCursor = "default";
  }

  return { squareColor, squareCursor, pieces };
}
