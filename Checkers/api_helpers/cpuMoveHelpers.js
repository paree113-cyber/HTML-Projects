// Returns true when a move has the expected coordinate payload shape.
export function isCoordinateMove(move) {
	return Array.isArray(move?.from)
		&& Array.isArray(move?.to)
		&& move.from.length === 2
		&& move.to.length === 2;
}

// Builds a stable lookup key for coordinate-based move matching.
export function toMoveKey(from, to) {
	return `${from[0]},${from[1]}->${to[0]},${to[1]}`;
}

// Indexes legal moves by id and by from/to coordinates for fast validation and mapping.
export function buildLegalMoveIndex(legalMoves) {
	const validMoveIds = new Set();
	const legalMoveByCoordinates = new Map();

	for (const move of legalMoves) {
		if (!move || !Number.isInteger(move.moveId)) {
			throw new Error('Each legal move must include an integer moveId.');
		}

		validMoveIds.add(move.moveId);
		const from = [move?.piece?.row, move?.piece?.col];
		const to = [move?.target?.row, move?.target?.col];
		if (from.every(Number.isInteger) && to.every(Number.isInteger)) {
			legalMoveByCoordinates.set(toMoveKey(from, to), move.moveId);
		}
	}

	return { validMoveIds, legalMoveByCoordinates };
}

// Resolves a missing moveId from coordinate payload using the legal move index.
export function resolveMoveIdFromCoordinates(moveId, move, legalMoveByCoordinates) {
	if (Number.isInteger(moveId) || !isCoordinateMove(move)) {
		return moveId;
	}

	const inferredMoveId = legalMoveByCoordinates.get(toMoveKey(move.from, move.to));
	return Number.isInteger(inferredMoveId) ? inferredMoveId : moveId;
}
