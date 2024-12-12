import { MouseEventHandler, JSX } from "react";
import { ICastlingConditions } from "./CastlingConditions";
import { IPiece } from "./Piece";

export interface ILeftScreen {
  pieces: IPiece[];
  castlingConditions: ICastlingConditions;
  passantPos: number;
  turn: string;
  piecesCollectedByWhite: JSX.Element[];
  piecesCollectedByBlack: JSX.Element[];
  reset: MouseEventHandler<HTMLButtonElement>;
}
