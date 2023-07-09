import { ISquare } from "../models/Square";

export default function Square({ value, color, cursor, onClick }: ISquare) {
  return (
    <button className={`square ${color}  ${cursor}`} onClick={onClick}>
      {value && value.icon}
    </button>
  );
}
