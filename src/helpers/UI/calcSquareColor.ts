import { EPieceAsciis } from "../../models/enums/PieceAsciis.enum";
import { IPiece } from "../../models/Piece";

export default function calcSquareColor(
  i: number,
  j: number,
  pieces: IPiece[]
) {
  const isEvenValues = isEven(i) && isEven(j);
  const isNotEvenValues = !isEven(i) && !isEven(j);
  const checkedPiece = pieces[i * 8 + j];

  let squareColor =
    isEvenValues || isNotEvenValues ? "white_square" : "black_square";

  if (checkedPiece.highlight) {
    squareColor =
      isEvenValues || isNotEvenValues
        ? "selected_white_square"
        : "selected_black_square";
  }

  if (checkedPiece.possible) {
    squareColor =
      isEvenValues || isNotEvenValues
        ? "highlighted_white_square"
        : "highlighted_black_square";
  }

  if (checkedPiece.ascii !== null && checkedPiece.ascii.toLowerCase() === EPieceAsciis.whiteKing) {
    if (checkedPiece.inCheck) {
      squareColor =
        isEvenValues || isNotEvenValues
          ? "in_check_square_white"
          : "in_check_square_black";
    }

    if (checkedPiece.checked) {
      squareColor = checkedPiece.checked ? "checked_square" : "stale_square";
    }
  }

  return squareColor;
}

function isEven(value: number) {
  return value % 2;
}
