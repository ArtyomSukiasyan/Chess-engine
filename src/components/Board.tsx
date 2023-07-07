import { colNumbers, rowNumbers } from "../constants/colNumbersAndRowNumbers";

export default function Board({ board }: any) {
  return (
    <div className="right_screen">
      <div className="row_label"> {rowNumbers} </div>
      <div className="table"> {board} </div>
      <div className="col_label"> {colNumbers} </div>
    </div>
  );
}
