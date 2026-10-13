import { MouseEventHandler } from "react";
import { flip } from "../constants/info";

export default function FlipButton({
  onClick,
}: {
  onClick: MouseEventHandler<HTMLButtonElement>;
}) {
  return (
    <button className="reset_button" onClick={onClick}>
      <p className="button_font">{flip}</p>
    </button>
  );
}
