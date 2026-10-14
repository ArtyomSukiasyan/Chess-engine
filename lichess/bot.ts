/**
 * Plays the engine on Lichess through the Bot API (https://lichess.org/api#tag/Bot).
 *
 *   LICHESS_TOKEN=... npm run lichess            play: accept challenges and play them
 *   LICHESS_TOKEN=... npm run lichess -- upgrade  turn the account into a BOT account (irreversible)
 *
 * The token needs the `bot:play` scope. It can also be put in a `.env` file next to package.json.
 */
import { chooseUciMove } from "../src/engine/bot";
import { replayGame } from "../src/engine/game";
import { BOT_LEVELS } from "../src/engine/levels";
import { WHITE } from "../src/engine/position";

const LICHESS = "https://lichess.org";
const LEVEL = BOT_LEVELS.find((level) => level.name === "Expert")!;
/**
 * Games played at once. The search blocks the process while it thinks, so in a second game the
 * clock would run meanwhile; raise this only for slow time controls.
 */
const MAX_GAMES = Number(process.env.MAX_GAMES ?? 1);
const ACCEPTED_VARIANTS = ["standard", "fromPosition"];

try {
  process.loadEnvFile();
} catch {
  // No .env file: the token must come from the environment.
}

const token = process.env.LICHESS_TOKEN;
if (!token) {
  console.error("Set LICHESS_TOKEN (a Lichess API token with the bot:play scope).");
  process.exit(1);
}

const log = (...args: unknown[]) => console.log(new Date().toISOString(), ...args);
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function api(path: string, init: RequestInit = {}): Promise<Response> {
  const response = await fetch(LICHESS + path, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, ...init.headers },
  });
  if (response.status === 429) {
    log("Rate limited by Lichess, waiting a minute");
    await sleep(60_000);
  }
  return response;
}

async function post(path: string, form?: Record<string, string>) {
  const response = await api(path, {
    method: "POST",
    body: form ? new URLSearchParams(form) : undefined,
  });
  if (!response.ok) log(`POST ${path} failed: ${response.status} ${await response.text()}`);
  return response.ok;
}

/** Calls `onEvent` for each JSON line of a Lichess stream until the stream ends. */
async function stream(path: string, onEvent: (event: any) => void | Promise<void>) {
  const response = await api(path);
  if (!response.ok || !response.body) {
    throw new Error(`GET ${path} failed: ${response.status} ${await response.text()}`);
  }
  const decoder = new TextDecoder();
  let buffer = "";
  for await (const chunk of response.body) {
    buffer += decoder.decode(chunk, { stream: true });
    let newline: number;
    while ((newline = buffer.indexOf("\n")) !== -1) {
      const line = buffer.slice(0, newline).trim();
      buffer = buffer.slice(newline + 1);
      if (line) await onEvent(JSON.parse(line)); // empty lines are keep-alives
    }
  }
}

/**
 * Thinking time for one move: the level's time, but never more than a fair share of the clock
 * (about 1/40 of what is left plus most of the increment), so fast games are not lost on time.
 */
function thinkTime(remainingMs: number | undefined, incrementMs = 0) {
  if (remainingMs === undefined) return LEVEL.settings.timeLimitMs; // correspondence / unlimited
  const share = remainingMs / 40 + incrementMs * 0.75;
  return Math.max(50, Math.min(LEVEL.settings.timeLimitMs, share, remainingMs / 4));
}

const games = new Set<string>();

async function playGame(gameId: string, botId: string) {
  let botColor: "white" | "black" = "white";
  let initialFen: string | undefined;

  const onState = async (state: any) => {
    if (state.status !== "started") return;

    const moves: string[] = state.moves ? state.moves.split(" ") : [];
    const positions = replayGame(moves, initialFen);
    const current = positions[positions.length - 1];
    if ((botColor === "white") !== (current.side === WHITE)) return;

    const remaining = botColor === "white" ? state.wtime : state.btime;
    const increment = botColor === "white" ? state.winc : state.binc;
    const settings = { ...LEVEL.settings, timeLimitMs: thinkTime(remaining, increment) };
    const move = chooseUciMove(current, positions.slice(0, -1), settings);
    if (move) await post(`/api/bot/game/${gameId}/move/${move}`);
  };

  try {
    await stream(`/api/bot/game/stream/${gameId}`, async (event) => {
      if (event.type === "gameFull") {
        botColor = event.white?.id === botId ? "white" : "black";
        initialFen = event.initialFen;
        log(`Game ${gameId}: playing ${botColor} vs ${event[botColor === "white" ? "black" : "white"]?.name ?? "?"}`);
        await post(`/api/bot/game/${gameId}/chat`, { room: "player", text: "Good luck, have fun!" });
        await onState(event.state);
      } else if (event.type === "gameState") {
        await onState(event);
        if (event.status !== "started") log(`Game ${gameId} ended: ${event.status} (winner: ${event.winner ?? "none"})`);
      }
    });
  } catch (error) {
    log(`Game ${gameId} stream error:`, error);
  } finally {
    games.delete(gameId);
  }
}

async function handleChallenge(challenge: any, botId: string) {
  const { id, variant, challenger } = challenge;
  if (challenger?.id === botId) return; // a challenge the bot sent itself

  let reason: string | null = null;
  if (!ACCEPTED_VARIANTS.includes(variant.key)) reason = "variant";
  else if (games.size >= MAX_GAMES) reason = "later";

  if (reason) {
    log(`Declining challenge ${id} from ${challenger?.name} (${reason})`);
    await post(`/api/challenge/${id}/decline`, { reason });
  } else {
    log(`Accepting challenge ${id} from ${challenger?.name} (${challenge.speed}, ${challenge.rated ? "rated" : "casual"})`);
    await post(`/api/challenge/${id}/accept`);
  }
}

async function main() {
  const account = (await (await api("/api/account")).json()) as {
    id: string;
    username: string;
    title?: string;
    error?: string;
  };
  if (account.error) throw new Error(`Lichess rejected the token: ${account.error}`);

  if (process.argv.includes("upgrade")) {
    if (await post("/api/bot/account/upgrade")) log(`${account.username} is now a BOT account`);
    return;
  }
  if (account.title !== "BOT") {
    console.error(
      `${account.username} is not a BOT account yet. Upgrade it with "npm run lichess -- upgrade"` +
        " (only possible for accounts that have not played any games; it cannot be undone)."
    );
    process.exit(1);
  }

  log(`Logged in as ${account.username}, playing at ${LEVEL.name} level, up to ${MAX_GAMES} games at once`);

  // The event stream occasionally drops; reconnect with a growing delay.
  for (let delay = 1000; ; delay = Math.min(delay * 2, 60_000)) {
    try {
      await stream("/api/stream/event", async (event) => {
        delay = 1000;
        if (event.type === "challenge") {
          await handleChallenge(event.challenge, account.id);
        } else if (event.type === "gameStart" && !games.has(event.game.id)) {
          games.add(event.game.id);
          void playGame(event.game.id, account.id);
        }
      });
      log("Event stream closed, reconnecting");
    } catch (error) {
      log("Event stream error, reconnecting:", error);
    }
    await sleep(delay);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
