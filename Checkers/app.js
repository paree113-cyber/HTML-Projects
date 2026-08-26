import 'dotenv/config';

import path from 'node:path';
import { promises as fs } from 'node:fs';
import { fileURLToPath } from 'node:url';

import express from 'express';
import { resolveCpuMove } from './cpu_moves/index.js';
import {
	buildLegalMoveIndex,
	isCoordinateMove,
	resolveMoveIdFromCoordinates
} from './api_helpers/cpuMoveHelpers.js';

const app = express();
const PORT = process.env.PORT || 3002;

const __filename = fileURLToPath(import.meta.url);
const rootDir = path.dirname(__filename);
const savesDir = path.join(rootDir, 'data');
const twoDGameSavePath = path.join(savesDir, '2d-game-save.json');

// Simple throttle: one CPU move request at a time to avoid rate-limit hammering
let cpuMoveInProgress = false;
const cpuMoveQueue = [];

async function processCpuMoveQueue() {
	if (cpuMoveInProgress || cpuMoveQueue.length === 0) return;
	cpuMoveInProgress = true;
	const { handler } = cpuMoveQueue.shift();
	try {
		await handler();
	} finally {
		cpuMoveInProgress = false;
		if (cpuMoveQueue.length > 0) {
			setImmediate(processCpuMoveQueue);
		}
	}
}

function withThrottle(handler) {
	return (req, res) => {
		cpuMoveQueue.push({ handler: () => handler(req, res) });
		processCpuMoveQueue();
	};
}

async function ensureSavesDirectory() {
	await fs.mkdir(savesDir, { recursive: true });
}

function isValid2dGameState(state) {
	if (!state || typeof state !== 'object') return false;
	if (!Array.isArray(state.board) || state.board.length !== 8) return false;
	if (!Array.isArray(state.pieces)) return false;
	if (state.score && typeof state.score !== 'object') return false;
	return true;
}

app.use(express.json({ limit: '1mb' }));

// Serve all project static files under /checkers (script, styles, images, favicons).
app.use(express.static(path.join(rootDir, "public")));

app.get('/checkers', (req, res) => {
	res.redirect('/checkers/2d');
});

app.get('/checkers/2d', (req, res) => {
	res.sendFile(path.join(rootDir, "views", "index.html"));
});

app.get('/checkers/3d', (req, res) => {
	res.sendFile(path.join(rootDir, "views", "3d.html"))
});

app.get('/api/checkers/2d/save', async (req, res) => {
	try {
		const raw = await fs.readFile(twoDGameSavePath, 'utf-8');
		const payload = JSON.parse(raw);
		return res.json(payload);
	} catch (error) {
		if (error.code === 'ENOENT') {
			return res.status(404).json({ message: 'No saved game found.' });
		}
		return res.status(500).json({ message: 'Failed to load saved game.' });
	}
});

app.post('/api/checkers/2d/save', async (req, res) => {
	const { state } = req.body || {};
	if (!isValid2dGameState(state)) {
		return res.status(400).json({ message: 'Invalid game state payload.' });
	}

	const payload = {
		state,
		savedAt: new Date().toISOString()
	};

	try {
		await ensureSavesDirectory();
		await fs.writeFile(twoDGameSavePath, JSON.stringify(payload, null, 2), 'utf-8');
		return res.status(201).json(payload);
	} catch (error) {
		return res.status(500).json({ message: 'Failed to save game state.' });
	}
});

app.post('/api/checkers/2d/cpu-move', withThrottle(async (req, res) => {
	const { state, legalMoves, difficulty } = req.body || {};
	if (!isValid2dGameState(state) || !Array.isArray(legalMoves) || legalMoves.length === 0) {
		return res.status(400).json({ message: 'Invalid CPU move payload.' });
	}

	let moveIndex;
	try {
		moveIndex = buildLegalMoveIndex(legalMoves);
	} catch {
		return res.status(400).json({ message: 'Each legal move must include an integer moveId.' });
	}

	try {
		const resolved = await resolveCpuMove({
			state,
			legalMoves,
			difficulty: difficulty === 'hard' ? 'hard' : 'easy',
			apiKey: process.env.GEMINI_API_KEY
		});

		const chosenMoveId = resolveMoveIdFromCoordinates(
			resolved.moveId,
			resolved.move,
			moveIndex.legalMoveByCoordinates
		);
		const chosenMove = resolved.move;
		const hasValidMoveId = Number.isInteger(chosenMoveId) && moveIndex.validMoveIds.has(chosenMoveId);
		const hasValidCoordinates = isCoordinateMove(chosenMove);

		if (!hasValidMoveId && !hasValidCoordinates) {
			return res.status(502).json({ message: 'CPU move resolver did not return a valid move.' });
		}

		console.info(
			'[CPU_API] difficulty=%s provider=%s fallback=%s move=%s legalMoves=%s',
			difficulty === 'hard' ? 'hard' : 'easy',
			resolved.provider,
			Boolean(resolved.fallback),
			hasValidMoveId ? chosenMoveId : JSON.stringify(chosenMove),
			legalMoves.length
		);
    const response = {
			moveId: hasValidMoveId ? chosenMoveId : null,
			move: hasValidCoordinates ? chosenMove : null,
			provider: resolved.provider,
			fallback: Boolean(resolved.fallback)
		};

		return res.json(response);
	} catch (error) {
		const isRateLimit = error?.status === 429 || error?.message?.includes('429');
		const statusCode = isRateLimit ? 429 : 500;
		const message = isRateLimit
			? 'Gemini API rate limit exceeded. CPU will use heuristic fallback next move.'
			: 'Failed to resolve CPU move.';

		console.error(
			'[CPU_API] Failed: statusCode=%d message=%s error=%s',
			statusCode,
			message,
			error?.message || String(error)
		);
		return res.status(statusCode).json({ message });
	}
}));

app.get('/', (req, res) => {
	res.redirect('/checkers/2d');
});

app.listen(PORT, () => {
	console.log(`Checkers server running at http://localhost:${PORT}/checkers/2d (2D) and /checkers/3d (3D)`);
  console.log(`Gemini API key configured: ${Boolean(process.env.GEMINI_API_KEY)}`);
});
