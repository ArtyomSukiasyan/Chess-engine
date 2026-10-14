import { ISquare } from "../models/Square";

export default function Square({
  value,
  color,
  cursor,
  onClick,
  rankLabel,
  fileLabel,
}: ISquare) {
  return (
    <button className={`square ${color}  ${cursor}`} onClick={onClick}>
      {value && value.icon}
      {rankLabel !== undefined && (
        <span className="coord coord_rank">{rankLabel}</span>
      )}
      {fileLabel !== undefined && (
        <span className="coord coord_file">{fileLabel}</span>
      )}
    </button>
  );
}
