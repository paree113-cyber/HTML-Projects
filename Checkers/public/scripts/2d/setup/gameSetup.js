import { getGameDomRefs } from './domRefs.js';
import { createBoardController } from '../logic/boardLogic.js';

export function initializeGame() {
    const dom = getGameDomRefs();
    const game = createBoardController(dom);
    const Board = game.board;
    const pieces = game.pieces;
    const tiles = game.tiles;

    function clearSelectedPieces() {
      document.querySelectorAll('.piece').forEach(function (pieceEl) {
        pieceEl.classList.remove('selected');
      });
    }

    game.setClearSelectedPiecesHandler(clearSelectedPieces);

    function setSaveStatus(message, isError) {
      if (!dom.saveStatus) return;
      dom.saveStatus.textContent = message;
      dom.saveStatus.style.color = isError ? '#8f1f2e' : '#344058';
    }

    async function persistState(state) {
      const response = await fetch('/api/checkers/2d/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ state: state })
      });

      if (!response.ok) {
        throw new Error('Save request failed with status ' + response.status);
      }

      return response.json();
    }

    async function fetchSavedState() {
      const response = await fetch('/api/checkers/2d/save');
      if (response.status == 404) return null;
      if (!response.ok) {
        throw new Error('Load request failed with status ' + response.status);
      }
      const payload = await response.json();
      return payload && payload.state ? payload.state : null;
    }

    function syncPlayModeControls() {
      const twoPlayerMode = dom.cpuToggle ? dom.cpuToggle.checked : false;
      Board.cpuEnabled = !twoPlayerMode;
      if (dom.cpuDifficultySelect) {
        dom.cpuDifficultySelect.disabled = twoPlayerMode;
      }
    }

    function syncControlsFromBoardState() {
      if (dom.cpuToggle) {
        dom.cpuToggle.checked = !Board.cpuEnabled;
      }
      if (dom.cpuDifficultySelect) {
        dom.cpuDifficultySelect.value = Board.cpuDifficulty;
        dom.cpuDifficultySelect.disabled = !Board.cpuEnabled;
      }
      if (dom.animationToggle) {
        dom.animationToggle.checked = Board.showCpuAnimation;
      }
    }

    Board.initalize();
    Board.check_if_jump_exist();
    Board.updateTurnIndicator();

    if (dom.cpuToggle) {
      syncPlayModeControls();
      dom.cpuToggle.addEventListener('change', function () {
        syncPlayModeControls();
        if (Board.cpuEnabled && Board.playerTurn == 2) {
          Board.scheduleCpuMove();
        }
      });
    }

    if (dom.cpuDifficultySelect) {
      dom.cpuDifficultySelect.value = Board.cpuDifficulty;
      dom.cpuDifficultySelect.addEventListener('change', function (event) {
        Board.cpuDifficulty = event.target.value == 'hard' ? 'hard' : 'easy';
        if (Board.playerTurn == 2) {
          Board.scheduleCpuMove();
        }
      });
    }

    if (dom.animationToggle) {
      Board.showCpuAnimation = dom.animationToggle.checked;
      dom.animationToggle.addEventListener('change', function (event) {
        Board.showCpuAnimation = event.target.checked;
      });
    }

    if (dom.saveButton) {
      dom.saveButton.addEventListener('click', async function () {
        try {
          const state = Board.buildSerializableState();
          const persisted = await persistState(state);
          const persistedAt = persisted && persisted.savedAt ? persisted.savedAt : state.savedAt;
          const savedDate = new Date(persistedAt).toLocaleString();
          setSaveStatus('Saved at ' + savedDate + '.', false);
        } catch (error) {
          console.error(error);
          setSaveStatus('Unable to save game.', true);
        }
      });
    }

    if (dom.resumeButton) {
      dom.resumeButton.addEventListener('click', async function () {
        try {
          const state = await fetchSavedState();
          if (!state) {
            setSaveStatus('No saved game found.', true);
            return;
          }
          const wasApplied = Board.applySerializableState(state);
          if (!wasApplied) {
            setSaveStatus('Saved data is invalid.', true);
            return;
          }
          syncControlsFromBoardState();
          const savedDate = state.savedAt ? new Date(state.savedAt).toLocaleString() : 'unknown time';
          setSaveStatus('Resumed saved game from ' + savedDate + '.', false);
        } catch (error) {
          console.error(error);
          setSaveStatus('Unable to resume saved game.', true);
        }
      });
    }

    if (dom.clearButton) {
      dom.clearButton.addEventListener('click', function () {
        Board.clear();
      });
    }

    document.addEventListener('click', function (event) {
      const pieceEl = event.target.closest('.piece');
      if (!pieceEl) return;

      if (Board.cpuEnabled && Board.playerTurn == 2) return;

      let selected = false;
      const parentClass = pieceEl.parentElement.className.split(' ')[0];
      const isPlayersTurn = parentClass == 'player' + Board.playerTurn + 'pieces';
      if (isPlayersTurn) {
        if (!Board.continuousjump && pieces[pieceEl.id].allowedtomove) {
          if (pieceEl.classList.contains('selected')) selected = true;
          clearSelectedPieces();
          if (!selected) {
            pieceEl.classList.add('selected');
          }
        } else {
          const exist = 'jump exist for other pieces, that piece is not allowed to move';
          const continuous = 'continuous jump exist, you have to jump the same piece';
          const message = !Board.continuousjump ? exist : continuous;
          console.log(message);
        }
      }
    });

    document.addEventListener('click', function (event) {
      const tileEl = event.target.closest('.tile');
      if (!tileEl) return;

      if (Board.cpuEnabled && Board.playerTurn == 2) return;

      const selectedElement = document.querySelector('.selected');
      if (!selectedElement) return;

      const tileID = tileEl.id.replace(/tile/, '');
      const tile = tiles[tileID];
      const piece = pieces[selectedElement.id];
      const inRange = tile.inRange(piece);
      if (inRange == 'wrong') return;

      if (inRange == 'jump') {
        if (piece.opponentJump(tile)) {
          piece.move(tile);
          if (piece.canJumpAny()) {
            piece.element.classList.add('selected');
            Board.continuousjump = true;
          } else {
            Board.changePlayerTurn();
          }
        }
      } else if (inRange == 'regular' && !Board.jumpexist) {
        if (!piece.canJumpAny()) {
          piece.move(tile);
          Board.changePlayerTurn();
        } else {
          alert('You must jump when possible!');
        }
      }
    });
}
