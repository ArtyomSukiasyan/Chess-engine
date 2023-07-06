import { ISquare } from "../models/Square";

export default function Square({
  value,
  color,
  corner,
  cursor,
  onClick,
}: ISquare) {
  return (
    <button className={"square " + color + corner + cursor} onClick={onClick}>
      {value && value.icon}
    </button>
  );
}
