import { JSX } from "react";

export default class FillerPiece {
  player: string | null;
  highlight: boolean;
  possible: boolean;
  icon: JSX.Element | null;
  ascii: string | null;

  constructor(player: string | null) {
    this.player = player;
    this.highlight = false;
    this.possible = false;
    this.icon = null;
    this.ascii = null;
  }

  canMove() {
    return false;
  }
}
