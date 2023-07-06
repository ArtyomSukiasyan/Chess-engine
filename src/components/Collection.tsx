import { IPiece } from "../models/Piece";

export default function Collected({ value }: { value: IPiece }) {
  return <button className={"collected"}> {value.icon} </button>;
}
