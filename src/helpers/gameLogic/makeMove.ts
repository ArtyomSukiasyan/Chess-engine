import { EPieceAsciis } from "../../models/enums/PieceAsciis.enum";
import { EPlayer } from "../../models/enums/Player.enum";
import { IPiece } from "../../models/Piece";
import FillerPiece from "../../pieces/FillerPiece";
import Queen from "../../pieces/Queen";

export default function makeMove(
  pieces: IPiece[],
  start: number,
  end: number,
  statePassantPos: number,
  passant_pos?: number
) {
  const isKing = pieces[start].ascii === EPieceAsciis.whiteKing || pieces[start].ascii === EPieceAsciis.blackKing;
  if (isKing && Math.abs(end - start) === 2) {
    if (end === (pieces[start].ascii === EPieceAsciis.whiteKing ? 62 : 6)) {
      pieces[end - 1] = pieces[end + 1];
      pieces[end - 1].highlight = true;
      pieces[end + 1] = new FillerPiece(null);
      pieces[end + 1].highlight = true;
    } else if (end === (pieces[start].ascii === EPieceAsciis.whiteKing ? 58 : 2)) {
      pieces[end + 1] = pieces[end - 2];
      pieces[end + 1].highlight = true;
      pieces[end - 2] = new FillerPiece(null);
      pieces[end - 2].highlight = true;
    }
  }

  const passant = !passant_pos ? statePassantPos : passant_pos;
  if (pieces[start].ascii?.toLowerCase() === EPieceAsciis.whitePawn) {
    if (end - start === -7 || end - start === 9) {
      if (start + 1 === passant) {
        pieces[start + 1] = new FillerPiece(null);
      }
    } else if (end - start === -9 || end - start === 7) {
      if (start - 1 === passant) pieces[start - 1] = new FillerPiece(null);
    }
  }

  pieces[end] = pieces[start];
  pieces[end].highlight = true;
  pieces[start] = new FillerPiece(null);
  pieces[start].highlight = true;

  if (pieces[end].ascii === EPieceAsciis.whitePawn && end >= 0 && end <= 7) {
    pieces[end] = new Queen(EPlayer.white);
    pieces[end].highlight = true;
  }
  if (pieces[end].ascii === EPieceAsciis.blackPawn && end >= 56 && end <= 63) {
    pieces[end] = new Queen(EPlayer.black);
    pieces[end].highlight = true;
  }

  return pieces;
}
