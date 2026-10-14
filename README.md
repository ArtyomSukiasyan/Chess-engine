# Chess Engine, in progress...

Simple Chess Engine that plays somewhere at the elo 1300-1400 level
Based on [React-ts-chess](https://github.com/ArtyomSukiasyan/react-ts-chess) and [React-chess](https://github.com/ArtyomSukiasyan/React-Chess);

## The bot

The bot lives in `src/engine` and runs in a Web Worker, so the page stays responsive while it thinks
(1.5 s per move, usually 8-10 plies deep).

- 0x88 board with make/unmake and Zobrist hashing (move generation verified with perft)
- Iterative deepening alpha-beta (PVS) with a transposition table, null-move pruning,
  late move reductions, check extensions and a quiescence search
- Move ordering: hash move, MVV-LVA captures, killer moves, history heuristic
- Tapered PeSTO evaluation, plus a mop-up term that drives a lone king to the edge to deliver mate
- Small opening book with common main lines, and repetition avoidance
- You can play as White or Black and flip the board

## How to install
- git clone https://github.com/ArtyomSukiasyan/Chess-engine.git
- cd Chess-engine
- npm i
- npm run dev
- npm test (engine tests)

Application uses PORT 5173
