import { EPieceAsciis } from "../../models/enums/PieceAsciis.enum";
import { IPiece } from "../../models/Piece";

export default function calcSquareColor(
  i: number,
  j: number,
  pieces: IPiece[]
) {
  const isEvenValues = isEven(i) && isEven(j);
  const isNotEvenValues = !isEven(i) && !isEven(j);
  const isWhiteSquare = isEvenValues || isNotEvenValues;

  const checkedPiece = pieces[i * 8 + j];
  const isWhiteKing = checkedPiece.ascii === EPieceAsciis.whiteKing;
  const isBlackKing = checkedPiece.ascii === EPieceAsciis.blackKing;
  const isKing = isWhiteKing || isBlackKing;

  let squareColor = isWhiteSquare ? "white_square" : "black_square";

  if (checkedPiece.highlight) {
    squareColor = isWhiteSquare
      ? "selected_white_square"
      : "selected_black_square";
  }

  if (checkedPiece.possible) {
    squareColor = isWhiteSquare
      ? "highlighted_white_square"
      : "highlighted_black_square";
  }

  if (checkedPiece.ascii !== null && isKing) {
    if (checkedPiece.inCheck) {
      squareColor = isWhiteSquare
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
