import { colNumbers, rowNumbers } from "../constants/colNumbersAndRowNumbers";
import getSquareClasses from "../helpers/UI/getSquareClasses";
import { IBoard } from "../models/Board";
import Square from "./Square";

export default function Board({
  onClick,
  statePieces,
  isBotRunning,
  mated,
}: IBoard) {
  const board = [];

  for (let i = 0; i < 8; i++) {
    const squareRows = [];

    for (let j = 0; j < 8; j++) {
      const { squareColor, squareCursor, pieces } = getSquareClasses(
        i,
        j,
        statePieces,
        isBotRunning,
        mated
      );

      squareRows.push(
        <Square
          key={i * 8 + j}
          value={pieces[i * 8 + j]}
          color={squareColor}
          cursor={squareCursor}
          onClick={() => onClick(i * 8 + j)}
        />
      );
    }

    board.push(<div key={i}>{squareRows}</div>);
  }

  return (
    <div className="right_screen">
      <div className="row_label"> {rowNumbers} </div>
      <div className="table"> {board} </div>
      <div className="col_label"> {colNumbers} </div>
    </div>
  );
}
