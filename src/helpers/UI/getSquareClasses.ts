import { EPlayer } from "../../models/enums/Player.enum";
import { IPiece } from "../../models/Piece";
import calcSquareColor from "./calcSquareColor";

export default function getSquareClasses(
  i: number,
  j: number,
  pieces: IPiece[],
  isBotRunning: boolean,
  mated: boolean
) {
  let squareColor = calcSquareColor(i, j, pieces);
  let squareCursor = "pointer";

  if (pieces[i * 8 + j].player !== EPlayer.white) {
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
