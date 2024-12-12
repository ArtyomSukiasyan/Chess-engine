import { JSX } from "react";
import { IMateWrapper } from "./MateWrapper";

export interface IMatchInfo extends IMateWrapper {
  piecesCollectedByWhite: JSX.Element[];
  piecesCollectedByBlack: JSX.Element[];
}
