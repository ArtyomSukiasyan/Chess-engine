/// <reference lib="webworker" />
import { BotMove, chooseMove } from "./bot";
import { BotSettings } from "./levels";
import { BotPosition } from "./position";

export interface BotRequest {
  id: number;
  position: BotPosition;
  history: BotPosition[];
  settings: BotSettings;
}

export interface BotResponse {
  id: number;
  move: BotMove | null;
}

/** Runs the search off the main thread so the page stays responsive while the bot thinks. */
self.onmessage = (event: MessageEvent<BotRequest>) => {
  const { id, position, history, settings } = event.data;
  const response: BotResponse = { id, move: chooseMove(position, history, settings) };
  self.postMessage(response);
};
