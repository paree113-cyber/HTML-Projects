import {GoogleGenAI} from '@google/genai';

function buildBoardString(state) {
  const board = Array.isArray(state?.board)
    ? state.board.map((row) => (Array.isArray(row) ? row.slice(0, 8) : [0, 0, 0, 0, 0, 0, 0, 0]))
    : [];

  const kings = new Set();
  if (Array.isArray(state?.pieces)) {
    for (const piece of state.pieces) {
      if (!piece || !piece.king || !Array.isArray(piece.position) || piece.position.length !== 2) continue;
      const [row, col] = piece.position;
      if (Number.isInteger(row) && Number.isInteger(col) && row >= 0 && row < 8 && col >= 0 && col < 8) {
        kings.add(`${row},${col}`);
      }
    }
  }

  return board
    .map((row, rowIndex) => row
      .map((cell, colIndex) => {
        const isKing = kings.has(`${rowIndex},${colIndex}`);
        if (cell === 1) return isKing ? 'WK' : 'W';
        if (cell === 2) return isKing ? 'BK' : 'B';
        return '.';
      })
      .join(' '))
    .join('\n');
}

function buildPrompt(state) {
  const boardState = buildBoardString(state);
  return [
    "You are playing a game of Checkers as Black.",
    "Here is the current 8x8 board state where 'B' is Black, 'W' is White, 'BK' is Black King, 'WK' is White King, and '.' is empty.",
    '',
    boardState,
    '',
    'Suggest the next checkers move for Black.',
    'Return strict JSON only: {"from":[row,col],"to":[row,col]}',
    'Rows and columns are 0-based indices.'
  ].join('\n');
}

export async function chooseGeminiMove({ state, legalMoves, apiKey }) {
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured.');
  }


  const prompt = buildPrompt(state);
  try {
    const ai = new GoogleGenAI({apiKey: apiKey});
    console.log('GEMINI PROMPT:\n', prompt);

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-preview',
      contents: prompt,
    });
    console.log(`Gemini response: ${JSON.stringify(response)}`);
    const nextMoveResponseText = response.candidates?.[0]?.content?.parts?.[0]?.text;
    const nextMoveResponseObject = JSON.parse(nextMoveResponseText);

    if (
      nextMoveResponseObject
      && Array.isArray(nextMoveResponseObject.from)
      && Array.isArray(nextMoveResponseObject.to)
      && nextMoveResponseObject.from.length === 2
      && nextMoveResponseObject.to.length === 2
    ) {
      return nextMoveResponseObject;
    }

    throw new Error(`Gemini returned invalid move payload: ${nextMoveResponseText}`);
  } catch (error) {
    throw error;
  }
}
// async function listModels(client) {
//     try {
//       // Fetch the list of models
//       const response = await client.models.list();
//       console.log("Available Models:");
//       const models = response.pageInternal;
//       // The response contains a 'models' array
//       models.forEach((model) => {
//         console.log(`- Name: ${model.name}`);
//         console.log('----------------------------');
//       });

//     } catch (error) {
//         console.error("Error fetching models:", error);
//     }
// }