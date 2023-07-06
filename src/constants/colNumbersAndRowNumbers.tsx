import Label from "../components/Label";

export const rowNumbers: JSX.Element[] = [];
for (let i = 8; i > 0; i--) {
  rowNumbers.push(<Label key={i} value={i} />);
}

export const colNumbers: JSX.Element[] = [];
for (let i = 1; i < 9; i++) {
  let letter;
  switch (i) {
    case 1:
      letter = "A";
      break;
    case 2:
      letter = "B";
      break;
    case 3:
      letter = "C";
      break;
    case 4:
      letter = "D";
      break;
    case 5:
      letter = "E";
      break;
    case 6:
      letter = "F";
      break;
    case 7:
      letter = "G";
      break;
    default:
      letter = "H";
  }
  colNumbers.push(<Label key={letter} value={letter} />);
}
