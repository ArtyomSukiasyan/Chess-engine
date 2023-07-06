import { MouseEventHandler } from "react";
import { IPiece } from "./Piece";

export interface ISquare {
  value: IPiece;
  color: string;
  cursor: string;
  corner: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
}
