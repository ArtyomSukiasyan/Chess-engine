import { MouseEventHandler } from "react";
import { IPiece } from "./Piece";

export interface ISquare {
  value: IPiece;
  color: string;
  cursor: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
  /** Coordinates drawn inside the edge squares (only shown on small screens). */
  rankLabel?: number;
  fileLabel?: string;
}
