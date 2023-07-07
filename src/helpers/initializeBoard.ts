import { EPlayer } from "../models/enums/Player.enum";
import Bishop from "../pieces/Bishop";
import FillerPiece from "../pieces/FillerPiece";
import King from "../pieces/King";
import Knight from "../pieces/Knight";
import Pawn from "../pieces/Pawn";
import Queen from "../pieces/Queen";
import Rook from "../pieces/Rook";

export default function initializeBoard() {
  const squares = Array(64).fill(null);

  for (let i = 8; i < 16; i++) {
    squares[i] = new Pawn(EPlayer.black);
  }

  for (let i = 8 * 6; i < 8 * 6 + 8; i++) {
    squares[i] = new Pawn(EPlayer.white);
  }

  squares[1] = new Knight(EPlayer.black);
  squares[6] = new Knight(EPlayer.black);
  squares[56 + 1] = new Knight(EPlayer.white);
  squares[56 + 6] = new Knight(EPlayer.white);
  squares[2] = new Bishop(EPlayer.black);
  squares[5] = new Bishop(EPlayer.black);
  squares[56 + 2] = new Bishop(EPlayer.white);
  squares[56 + 5] = new Bishop(EPlayer.white);
  squares[0] = new Rook(EPlayer.black);
  squares[7] = new Rook(EPlayer.black);
  squares[56 + 0] = new Rook(EPlayer.white);
  squares[56 + 7] = new Rook(EPlayer.white);
  squares[3] = new Queen(EPlayer.black);
  squares[4] = new King(EPlayer.black);
  squares[56 + 3] = new Queen(EPlayer.white);
  squares[56 + 4] = new King(EPlayer.white);

  for (let i = 0; i < 64; i++) {
    if (squares[i] === null) {
      squares[i] = new FillerPiece(null);
    }
  }

  return squares;
}
