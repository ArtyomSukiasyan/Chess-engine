import { ReactElement } from "react";

export default class Rook {
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
        {player === "w" ? String.fromCharCode(9814) : String.fromCharCode(9820)}
      </span>
    );
    this.ascii = player === "w" ? "r" : "R";
  }

  canMove(start: number, end: number) {
    const startRow = 8 - Math.floor(start / 8);
    const startCol = (start % 8) + 1;
    const endRow = 8 - Math.floor(end / 8);
    const endCol = (end % 8) + 1;

    const rowDiff = endRow - startRow;
    const colDiff = endCol - startCol;

    return rowDiff * colDiff === 0 && rowDiff + colDiff !== 0;
  }
}
