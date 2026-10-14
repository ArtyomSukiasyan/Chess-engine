/// <reference lib="webworker" />
import { BotMove, chooseMove } from "./bot";
import { BotPosition } from "./position";

export interface BotRequest {
  id: number;
  position: BotPosition;
  history: BotPosition[];
  timeLimitMs: number;
}

export interface BotResponse {
  id: number;
  move: BotMove | null;
}

/** Runs the search off the main thread so the page stays responsive while the bot thinks. */
self.onmessage = (event: MessageEvent<BotRequest>) => {
  const { id, position, history, timeLimitMs } = event.data;
  const response: BotResponse = { id, move: chooseMove(position, history, timeLimitMs) };
  self.postMessage(response);
};
