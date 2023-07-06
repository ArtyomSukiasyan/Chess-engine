export interface IPiece {
  ascii: string | null;
  highlight: boolean;
  icon: JSX.Element | null;
  player: string | null;
  possible: boolean;
  canMove: (start: number, end: number) => boolean;
  inCheck?: boolean;
  checked?: boolean;
}
