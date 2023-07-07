import { IPiece } from "./Piece";

export interface IBoard {
  onClick: Function;
  statePieces: IPiece[];
  isBotRunning: boolean;
  mated: boolean;
}
