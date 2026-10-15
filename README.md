# Chess Engine, in progress...

Simple Chess Engine that plays somewhere at the elo 1300-1400 level
Based on [React-ts-chess](https://github.com/ArtyomSukiasyan/react-ts-chess) and [React-chess](https://github.com/ArtyomSukiasyan/React-Chess);

## The bot

The bot lives in `src/engine` and runs in a Web Worker, so the page stays responsive while it thinks.
It has five levels, from Beginner (1 ply, sometimes a random move) to Expert (4 s per move);
the default, Hard, thinks 1.5 s per move and usually reaches 8-10 plies.

- 0x88 board with make/unmake and Zobrist hashing (move generation verified with perft)
- Iterative deepening alpha-beta (PVS) with a transposition table, null-move pruning,
  late move reductions, check extensions and a quiescence search
- Move ordering: hash move, MVV-LVA captures, killer moves, history heuristic
- Tapered PeSTO evaluation, plus a mop-up term that drives a lone king to the edge to deliver mate
- Small opening book with common main lines, and repetition avoidance
- You can play as White or Black and flip the board
- Move list in standard algebraic notation, and undo (takes back your last move and the bot's reply)

## How to install
- git clone https://github.com/ArtyomSukiasyan/Chess-engine.git
- cd Chess-engine
- npm i
- npm run dev
- npm test (engine tests)

Application uses PORT 5173

## Lichess bot
`lichess/bot.ts` plays the engine on Lichess (Expert level) through the Bot API.
It needs a BOT account and an API token with the `bot:play` scope, in `.env`:

    LICHESS_TOKEN=lip_...

- `npm run lichess -- upgrade` turns a fresh account (no games played) into a BOT account. This cannot be undone.
- `npm run lichess` runs the bot locally.

### On a server (Docker)
    git clone https://github.com/ArtyomSukiasyan/Chess-engine.git
    cd Chess-engine
    echo "LICHESS_TOKEN=lip_..." > .env
    docker compose up -d --build

Docker restarts the bot after crashes and reboots. `docker compose logs -f` shows its games;
after `git pull`, run `docker compose up -d --build` again to update it.
