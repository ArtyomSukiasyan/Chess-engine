import {
  blackIsInCheck,
  blackIsMated,
  blackIsStaled,
  youAreInCheck,
  youAreMated,
  youAreStaled,
} from "../../constants/mateWrappers";
import { ICastlingConditions } from "../../models/CastlingConditions";
import { EPlayer } from "../../models/enums/Player.enum";
import { IPiece } from "../../models/Piece";
import checkmate from "./checkmate";
import inCheck from "./inCheck";
import stalemate from "./stalemate";

export default function getMateInfo(
  pieces: IPiece[],
  passantPos: number,
  castlingConditions: ICastlingConditions,
  turn: string
) {
  const isWhiteTurn = turn === EPlayer.white;

  const {
    isBlackChecked,
    isBlackMated,
    isBlackStaled,
    isWhiteChecked,
    isWhiteMated,
    isWhiteStaled,
  } = getInfoConditions(pieces, passantPos, castlingConditions);

  return [
    {
      condition: isWhiteChecked,
      text: youAreInCheck,
      additionalCondition: true,
    },
    {
      condition: isBlackChecked,
      text: blackIsInCheck,
      additionalCondition: true,
    },
    {
      condition: isWhiteMated,
      text: youAreMated,
      additionalCondition: true,
    },
    {
      condition: isBlackMated,
      text: blackIsMated,
      additionalCondition: true,
    },
    {
      condition: isWhiteStaled,
      text: youAreStaled,
      additionalCondition: isWhiteTurn,
    },
    {
      condition: isBlackStaled,
      text: blackIsStaled,
      additionalCondition: !isWhiteTurn,
    },
  ];
}

function getInfoConditions(
  pieces: IPiece[],
  passantPos: number,
  castlingConditions: ICastlingConditions
) {
  const isWhiteChecked = inCheck(
    EPlayer.white,
    pieces,
    passantPos,
    castlingConditions
  );

  const isBlackChecked = inCheck(
    EPlayer.black,
    pieces,
    passantPos,
    castlingConditions
  );

  const isWhiteMated = checkmate(
    EPlayer.white,
    pieces,
    passantPos,
    castlingConditions
  );

  const isBlackMated = checkmate(
    EPlayer.black,
    pieces,
    passantPos,
    castlingConditions
  );

  const isWhiteStaled = stalemate(
    EPlayer.white,
    pieces,
    passantPos,
    castlingConditions
  );

  const isBlackStaled = stalemate(
    EPlayer.black,
    pieces,
    passantPos,
    castlingConditions
  );

  return {
    isBlackChecked,
    isBlackMated,
    isBlackStaled,
    isWhiteChecked,
    isWhiteMated,
    isWhiteStaled,
  };
}
