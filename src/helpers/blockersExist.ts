import { IPiece } from "../models/Piece";

export default function blockersExist(
  start: number,
  end: number,
  pieces: IPiece[]
) {
  const startRow = 8 - Math.floor(start / 8);
  const startCol = (start % 8) + 1;
  const endRow = 8 - Math.floor(end / 8);
  const endCol = (end % 8) + 1;

  let rowDiff = endRow - startRow;
  let colDiff = endCol - startCol;
  let rowCtr = 0;
  let colCtr = 0;

  while (colCtr !== colDiff || rowCtr !== rowDiff) {
    const position = 64 - startRow * 8 + -8 * rowCtr + (startCol - 1 + colCtr);
    const isValidPiece = pieces[position].ascii !== null;

    if (isValidPiece && pieces[position] !== pieces[start]) {
      return true;
    }

    if (colCtr !== colDiff) {
      if (colDiff > 0) {
        ++colCtr;
      } else {
        --colCtr;
      }
    }

    if (rowCtr !== rowDiff) {
      if (rowDiff > 0) {
        ++rowCtr;
      } else {
        --rowCtr;
      }
    }
  }

  return false;
}
