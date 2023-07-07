import { IPiece } from "../models/Piece";
import calcSquareColor from "./calcSquareColor";

export default function getSquareClasses(
  i: number,
  j: number,
  pieces: IPiece[],
  isBotRunning: boolean,
  mated: boolean
) {
  let squareCorner = null;

  if (i === 0 && j === 0) {
    squareCorner = " top_left_square ";
  } else if (i === 0 && j === 7) {
    squareCorner = " top_right_square ";
  } else if (i === 7 && j === 0) {
    squareCorner = " bottom_left_square ";
  } else if (i === 7 && j === 7) {
    squareCorner = " bottom_right_square ";
  } else {
    squareCorner = " ";
  }

  let squareColor = calcSquareColor(i, j, pieces);
  let squareCursor = "pointer";

  if (pieces[i * 8 + j].player !== "w") {
    squareCursor = "default";
  }

  if (isBotRunning && !mated) {
    squareCursor = "isBotRunning";
  }

  if (mated) {
    squareCursor = "default";
  }

  return { squareColor, squareCorner, squareCursor, pieces };
}
