import { IPiece } from "../../models/Piece";

export default function blockersExist(
  start: number,
  end: number,
  pieces: IPiece[]
) {
  const startRow = getRowByPosition(start);
  const startCol = getColByPosition(start);
  const endRow = getRowByPosition(end);
  const endCol = getColByPosition(end);

  let rowDiff = endRow - startRow;
  let colDiff = endCol - startCol;
  let rowCtr = 0;
  let colCtr = 0;

  const currentRow = startRow * 8;
  const rowBorder = 64 - currentRow;

  while (colCtr !== colDiff || rowCtr !== rowDiff) {
    const currentRowCtr = 8 * rowCtr;
    const colBorder = startCol - 1 + colCtr - currentRowCtr;

    const position = rowBorder + colBorder;
    const isValidPiece = pieces[position].ascii !== null;
    
    const isSamePosition = pieces[position] !== pieces[start];

    if (isValidPiece && isSamePosition) {
      return true;
    }

    if (rowCtr !== rowDiff) {
      if (rowDiff > 0) {
        ++rowCtr;
      } else {
        --rowCtr;
      }
    }

    if (colCtr !== colDiff) {
      if (colDiff > 0) {
        ++colCtr;
      } else {
        --colCtr;
      }
    }
  }

  return false;
}

function getRowByPosition(position: number) {
  return 8 - Math.floor(position / 8);
}

function getColByPosition(position: number) {
  return (position % 8) + 1;
}
