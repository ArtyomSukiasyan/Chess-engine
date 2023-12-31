import { ReactElement } from "react";
import { EPlayer } from "../models/enums/Player.enum";

export default class Bishop {
  player: string;
  highlight: boolean;
  possible: boolean;
  icon: ReactElement<{}, string>;
  ascii: string;

  constructor(player: string) {
    this.player = player;
    this.highlight = false;
    this.possible = false;
    this.icon = (
      <span className="piece">
        {player === EPlayer.white ? String.fromCharCode(9815) : String.fromCharCode(9821)}
      </span>
    );
    this.ascii = player === EPlayer.white ? EPlayer.black : EPlayer.black;
  }

  canMove(start: number, end: number) {
    const startRow = 8 - Math.floor(start / 8);
    const startCol = (start % 8) + 1;
    const endRow = 8 - Math.floor(end / 8);
    const endCol = (end % 8) + 1;

    const rowDiff = endRow - startRow;
    const colDiff = endCol - startCol;

    return rowDiff === colDiff || rowDiff === -colDiff;
  }
}
