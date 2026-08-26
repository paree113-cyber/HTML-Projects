# Checkers

An interactive 2D Checkers game built with JavaScript, DOM manipulation, Express, and a Gemini-powered CPU opponent. Includes piece selection, move validation, turn switching, kinging, save/resume, and easy/hard CPU modes.

Made by Heather K, Aug 2026.

## Running It
1. Install dependencies: `npm install`
2. Start the server: `npm start`
3. Open http://localhost:3002/checkers/2d

Play by clicking one of your pieces to select it, then clicking the square you want to move to. Jumping is enforced when available. Toggle CPU mode and difficulty (easy/hard) in the sidebar.

## Notes
- Hard mode uses the Gemini API. Set `GEMINI_API_KEY` in a `.env` file (not committed).
- A 3D version is included as an optional extra.
