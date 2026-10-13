import { MouseEventHandler } from "react";
import { playAsBlack, playAsWhite } from "../constants/info";
import { EPlayer } from "../models/enums/Player.enum";

export default function SwitchColorButton({
  onClick,
  humanColor,
}: {
  onClick: MouseEventHandler<HTMLButtonElement>;
  humanColor: string;
}) {
  return (
    <button className="reset_button" onClick={onClick}>
      <p className="button_font">
        {humanColor === EPlayer.white ? playAsBlack : playAsWhite}
      </p>
    </button>
  );
}
