import { IPiece } from "../models/Piece";

export default function Collected({ value }: { value: IPiece }) {
  return <span className="collected"> {value.icon} </span>;
}
