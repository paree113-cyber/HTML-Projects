# Checkers

An interactive 2D Checkers game built with JavaScript, DOM manipulation, Express
routes, and a Gemini-powered CPU opponent. This project connects a frontend game
board to a backend API: player interactions update the DOM and game state, moves
are validated, and an optional CPU opponent requests its moves from the server.

Made by Heather K, Aug 2026.

## Features

- Click-to-select pieces with visual highlighting
- Move validation (diagonal moves, forced jumps, multi-jumps)
- Turn switching with a turn indicator
- Piece capture, scoring, and kinging
- Win detection and end-of-game handling
- Save and resume a game via backend API + JSON persistence
- CPU opponent with **Easy** (random legal move) and **Hard** (Gemini AI) modes
- Optional 3D board (extra, two-player)

## Tech

- **Frontend:** vanilla JavaScript + DOM manipulation
- **Backend:** Node.js + Express (ES modules)
- **AI:** Google Gemini via `@google/genai`, with a heuristic fallback

## Running It

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the server:
   ```bash
   npm start
   ```
3. Open http://localhost:3002/checkers/2d

Play by clicking one of your pieces to select it, then clicking the square you
want to move to. Jumping is enforced when a jump is available. Use the sidebar to
toggle CPU mode, choose Easy/Hard difficulty, and save or resume a game.

## Configuration

Hard-mode CPU uses the Gemini API. Add your key to a `.env` file in the project root:

```
GEMINI_API_KEY=your_key_here
```

`.env` is gitignored and never committed. Without a key, hard mode automatically
falls back to a built-in heuristic.

## Credits

The core board engine is based on an open-source checkers project (MIT license) by
Jason Lawrence Wong. Game completion, backend routes, save/load, CPU integration,
and Gemini wiring by Heather K.
