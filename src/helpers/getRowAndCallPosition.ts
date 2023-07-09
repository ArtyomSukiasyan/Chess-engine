export function getRowByPosition(position: number) {
  return 8 - Math.floor(position / 8);
}

export function getColByPosition(position: number) {
  return (position % 8) + 1;
}
