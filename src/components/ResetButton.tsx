import { MouseEventHandler } from "react";
import { restart } from "../constants/info";

export default function ResetButton({
  onClick,
}: {
  onClick: MouseEventHandler<HTMLButtonElement>;
}) {
  return (
    <div className="button_wrapper">
      <button className="reset_button" onClick={onClick}>
        <p className="button_font">{restart}</p>
      </button>
    </div>
  );
}
