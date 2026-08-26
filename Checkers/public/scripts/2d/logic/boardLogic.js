import { createInitialBoard } from '../models/gameState.js';
import { Piece, Tile } from '../models/gameModels.js';

export function createBoardController(dom) {
    const pieces = [];
    const tiles = [];

    function setCpuLoading(isLoading) {
      if (dom.toolbarElement) {
        dom.toolbarElement.classList.toggle('game-toolbar--loading', Boolean(isLoading));
      }
      if (dom.cpuLoadingIndicator) {
        dom.cpuLoadingIndicator.setAttribute('aria-hidden', isLoading ? 'false' : 'true');
      }
    }

    const board = {
      board: createInitialBoard(),
      score: {
        player1: 0,
        player2: 0
      },
      playerTurn: 1,
      jumpexist: false,
      continuousjump: false,
      cpuEnabled: false,
      cpuDifficulty: 'easy',
      showCpuAnimation: true,
      cpuMoveDelayMs: 350,
      dictionary: ['0vmin', '10vmin', '20vmin', '30vmin', '40vmin', '50vmin', '60vmin', '70vmin', '80vmin', '90vmin'],
      clearSelectedPieces: function () {},
      initalize: function () {
        let countPieces = 0;
        let countTiles = 0;
        for (let row in this.board) {
          for (let column in this.board[row]) {
            if (row % 2 == 1) {
              if (column % 2 == 0) {
                countTiles = this.tileRender(row, column, countTiles);
              }
            } else if (column % 2 == 1) {
              countTiles = this.tileRender(row, column, countTiles);
            }

            if (this.board[row][column] == 1) {
              countPieces = this.playerPiecesRender(1, row, column, countPieces);
            } else if (this.board[row][column] == 2) {
              countPieces = this.playerPiecesRender(2, row, column, countPieces);
            }
          }
        }
      },
      tileRender: function (row, column, countTiles) {
        dom.tilesElement.insertAdjacentHTML('beforeend', "<div class='tile' id='tile" + countTiles + "' style='top:" + this.dictionary[row] + ';left:' + this.dictionary[column] + ";'></div>");
        tiles[countTiles] = new Tile(document.getElementById('tile' + countTiles), [parseInt(row), parseInt(column)], {
          pieces: pieces
        });
        return countTiles + 1;
      },
      playerPiecesRender: function (playerNumber, row, column, countPieces) {
        const container = playerNumber == 1 ? dom.player1PiecesContainer : dom.player2PiecesContainer;
        container.insertAdjacentHTML('beforeend', "<div class='piece' id='" + countPieces + "' style='top:" + this.dictionary[row] + ';left:' + this.dictionary[column] + ";'></div>");
        pieces[countPieces] = new Piece(document.getElementById(String(countPieces)), [parseInt(row), parseInt(column)], {
          board: this,
          pieces: pieces,
          dom: dom
        });
        return countPieces + 1;
      },
      isValidPlacetoMove: function (row, column) {
        if (row < 0 || row > 7 || column < 0 || column > 7) return false;
        return this.board[row][column] == 0;
      },
      changePlayerTurn: function () {
        this.playerTurn = this.playerTurn == 1 ? 2 : 1;
        this.updateTurnIndicator();
        this.check_if_jump_exist();
        this.scheduleCpuMove();
      },
      updateTurnIndicator: function () {
        if (!dom.turnElement) return;
        if (this.playerTurn == 1) {
          dom.turnElement.style.background = 'linear-gradient(to right, #BEEE62 50%, transparent 50%)';
        } else {
          dom.turnElement.style.background = 'linear-gradient(to right, transparent 50%, #BEEE62 50%)';
        }
      },
      checkifAnybodyWon: function () {
        if (this.score.player1 == 12) return 1;
        if (this.score.player2 == 12) return 2;
        return false;
      },
      clear: function () {
        location.reload();
      },
      check_if_jump_exist: function () {
        this.jumpexist = false;
        this.continuousjump = false;
        for (let k of pieces) {
          k.allowedtomove = false;
          if (k.position.length != 0 && k.player == this.playerTurn && k.canJumpAny()) {
            this.jumpexist = true;
            k.allowedtomove = true;
          }
        }
        if (!this.jumpexist) {
          for (let k of pieces) k.allowedtomove = true;
        }
      },
      getLegalMovesForPiece: function (piece, jumpsOnly) {
        const moves = [];
        for (const tile of tiles) {
          if (!tile) continue;
          const inRange = tile.inRange(piece);
          if (inRange == 'jump') {
            if (piece.canOpponentJump(tile.position)) {
              moves.push({ piece: piece, tile: tile, type: 'jump' });
            }
          } else if (!jumpsOnly && inRange == 'regular') {
            moves.push({ piece: piece, tile: tile, type: 'regular' });
          }
        }
        return moves;
      },
      requestCpuMoveFromApi: async function (moves) {
        const legalMoves = moves.map(function (move, index) {
          return {
            moveId: index,
            type: move.type,
            pieceId: Number(move.piece.element.id),
            piece: {
              row: move.piece.position[0],
              col: move.piece.position[1],
              king: move.piece.king
            },
            target: {
              row: move.tile.position[0],
              col: move.tile.position[1]
            }
          };
        });

        setCpuLoading(true);
        try {
          const response = await fetch('/api/checkers/2d/cpu-move', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              state: this.buildSerializableState(),
              legalMoves: legalMoves,
              difficulty: this.cpuDifficulty
            })
          });

          if (!response.ok) {
            throw new Error('CPU move API request failed with status ' + response.status);
          }

          const payload = await response.json();
          if (!payload) {
            throw new Error('CPU move API returned empty payload');
          }

          if (Number.isInteger(payload.moveId) && payload.moveId >= 0 && payload.moveId < moves.length) {
            console.debug(
              '[CPU_CLIENT] difficulty=%s provider=%s fallback=%s moveId=%s',
              this.cpuDifficulty,
              payload.provider || 'unknown',
              Boolean(payload.fallback),
              payload.moveId
            );
            return moves[payload.moveId];
          }

          const move = payload.move;
          if (move && Array.isArray(move.from) && Array.isArray(move.to) && move.from.length == 2 && move.to.length == 2) {
            const matchedIndex = legalMoves.findIndex(function (legalMove) {
              return legalMove.piece.row == move.from[0]
                && legalMove.piece.col == move.from[1]
                && legalMove.target.row == move.to[0]
                && legalMove.target.col == move.to[1];
            });

            if (matchedIndex >= 0 && matchedIndex < moves.length) {
              console.debug(
                '[CPU_CLIENT] difficulty=%s provider=%s fallback=%s move=%o',
                this.cpuDifficulty,
                payload.provider || 'unknown',
                Boolean(payload.fallback),
                move
              );
              return moves[matchedIndex];
            }
          }

          throw new Error('CPU move API returned invalid move');
        } finally {
          setCpuLoading(false);
        }
      },
      scheduleCpuMove: function () {
        if (!this.cpuEnabled || this.playerTurn != 2) return;
        if (this.checkifAnybodyWon()) return;
        window.setTimeout(() => {
          this.playCpuMove().catch(function (error) {
            console.error('CPU move failed:', error);
          });
        }, this.cpuMoveDelayMs);
      },
      playCpuMove: async function () {
        if (!this.cpuEnabled || this.playerTurn != 2) return;
        if (this.checkifAnybodyWon()) return;

        this.clearSelectedPieces();
        this.check_if_jump_exist();

        const candidatePieces = pieces.filter(function (piece) {
          return piece.position.length != 0 && piece.player == 2 && piece.allowedtomove;
        });

        let allMoves = [];
        for (const piece of candidatePieces) {
          const pieceMoves = this.getLegalMovesForPiece(piece, this.jumpexist);
          allMoves = allMoves.concat(pieceMoves);
        }

        if (allMoves.length == 0) return;

        const chosenMove = await this.requestCpuMoveFromApi(allMoves);
        if (!chosenMove) return;
        if (this.showCpuAnimation) {
          chosenMove.piece.element.classList.add('cpu-thinking');
        }
        if (chosenMove.type == 'jump') {
          if (!chosenMove.piece.opponentJump(chosenMove.tile)) return;
          chosenMove.piece.move(chosenMove.tile);

          if (chosenMove.piece.canJumpAny()) {
            this.continuousjump = true;
            chosenMove.piece.element.classList.add('selected');
            window.setTimeout(() => {
              this.playCpuJumpChain(chosenMove.piece).catch(function (error) {
                console.error('CPU jump-chain failed:', error);
              });
            }, this.cpuMoveDelayMs);
          } else {
            this.changePlayerTurn();
          }
        } else {
          chosenMove.piece.move(chosenMove.tile);
          this.changePlayerTurn();
        }
      },
      playCpuJumpChain: async function (piece) {
        if (!this.cpuEnabled || this.playerTurn != 2) return;
        if (!piece || piece.position.length == 0) return;

        const jumpMoves = this.getLegalMovesForPiece(piece, true);
        if (jumpMoves.length == 0) {
          this.continuousjump = false;
          this.changePlayerTurn();
          return;
        }

        const chosenMove = await this.requestCpuMoveFromApi(jumpMoves);
        if (!chosenMove) {
          this.continuousjump = false;
          this.changePlayerTurn();
          return;
        }
        if (!piece.opponentJump(chosenMove.tile)) {
          this.continuousjump = false;
          this.changePlayerTurn();
          return;
        }

        piece.move(chosenMove.tile);
        if (piece.canJumpAny()) {
          this.continuousjump = true;
          piece.element.classList.add('selected');
          window.setTimeout(() => {
            this.playCpuJumpChain(piece).catch(function (error) {
              console.error('CPU jump-chain failed:', error);
            });
          }, this.cpuMoveDelayMs);
        } else {
          this.changePlayerTurn();
        }
      },
      str_board: function () {
        let ret = '';
        for (let i in this.board) {
          for (let j in this.board[i]) {
            let found = false;
            for (let k of pieces) {
              if (k.position[0] == i && k.position[1] == j) {
                if (k.king) ret += this.board[i][j] + 2;
                else ret += this.board[i][j];
                found = true;
                break;
              }
            }
            if (!found) ret += '0';
          }
        }
        return ret;
      },
      buildSerializableState: function () {
        return {
          board: this.board.map(function (row) {
            return row.slice();
          }),
          score: {
            player1: this.score.player1,
            player2: this.score.player2
          },
          playerTurn: this.playerTurn,
          cpuEnabled: this.cpuEnabled,
          cpuDifficulty: this.cpuDifficulty,
          showCpuAnimation: this.showCpuAnimation,
          winnerText: dom.winnerElement ? dom.winnerElement.textContent : '',
          pieces: pieces.map(function (piece, index) {
            return {
              id: index,
              position: piece.position.length ? piece.position.slice() : [],
              king: piece.king
            };
          }),
          savedAt: new Date().toISOString(),
          version: 1
        };
      },
      applySerializableState: function (state) {
        if (!state || !Array.isArray(state.board) || state.board.length != 8 || !Array.isArray(state.pieces) || state.pieces.length != pieces.length) {
          return false;
        }

        this.board = state.board.map(function (row) {
          return Array.isArray(row) ? row.slice(0, 8) : [0, 0, 0, 0, 0, 0, 0, 0];
        });
        this.score.player1 = state.score && Number.isFinite(state.score.player1) ? state.score.player1 : 0;
        this.score.player2 = state.score && Number.isFinite(state.score.player2) ? state.score.player2 : 0;
        this.playerTurn = state.playerTurn == 2 ? 2 : 1;
        this.cpuEnabled = Boolean(state.cpuEnabled);
        this.cpuDifficulty = state.cpuDifficulty == 'hard' ? 'hard' : 'easy';
        this.showCpuAnimation = state.showCpuAnimation !== false;

        pieces.forEach((piece, index) => {
          const pieceState = state.pieces[index] || {};
          const hasPosition = Array.isArray(pieceState.position) && pieceState.position.length == 2;
          piece.element.classList.remove('selected', 'cpu-thinking');
          piece.king = false;

          if (!hasPosition) {
            piece.position = [];
            piece.element.style.display = 'none';
            piece.element.style.backgroundImage = '';
            return;
          }

          const row = Number(pieceState.position[0]);
          const column = Number(pieceState.position[1]);
          piece.position = [row, column];
          piece.element.style.display = 'inline-block';
          piece.element.style.top = this.dictionary[row];
          piece.element.style.left = this.dictionary[column];
          piece.element.style.backgroundImage = '';
          if (pieceState.king) {
            piece.makeKing();
          }
        });

        if (dom.player1Element) {
          dom.player1Element.querySelectorAll('.capturedPiece').forEach(function (el) {
            el.remove();
          });
          for (let i = 0; i < this.score.player1; i++) {
            dom.player1Element.insertAdjacentHTML('beforeend', "<div class='capturedPiece'></div>");
          }
        }
        if (dom.player2Element) {
          dom.player2Element.querySelectorAll('.capturedPiece').forEach(function (el) {
            el.remove();
          });
          for (let i = 0; i < this.score.player2; i++) {
            dom.player2Element.insertAdjacentHTML('beforeend', "<div class='capturedPiece'></div>");
          }
        }

        if (dom.winnerElement) {
          dom.winnerElement.textContent = state.winnerText || '';
        }

        this.continuousjump = false;
        this.jumpexist = false;
        this.updateTurnIndicator();
        this.check_if_jump_exist();

        if (this.cpuEnabled && this.playerTurn == 2 && !this.checkifAnybodyWon()) {
          this.scheduleCpuMove();
        }

        return true;
      }
    };

    return {
      board: board,
      pieces: pieces,
      tiles: tiles,
      setClearSelectedPiecesHandler: function (handler) {
        board.clearSelectedPieces = handler;
      }
    };
}
