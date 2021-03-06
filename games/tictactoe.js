const Game = require('../models/game');

module.exports = class TicTacToe extends Game {
    constructor({ id, room_id, player1, player2, is_public, game_type, winner_id }) {
        super({ id, room_id, player1, player2, is_public, game_type, winner_id });
        this.moves = Array(9);
        this.wins = [[0,1,2], [3,4,5], [6,7,8], [0,3,6], [1,4,7], [2,5,8], [0,4,8], [2,4,6]];
    }

    async addMove(boardIndex, userId) {
        const lastMove = await Game.lastMove(this.id);
        let lastUser = this.player2;
        if (lastMove) {
            lastUser = lastMove.user_id;
        }
        await this.fetchMoves();
        if (this.moves[boardIndex] === undefined && userId !== lastUser) {
            this.moves[boardIndex] = userId;
            await Game.saveMove(this.id, userId, boardIndex);
            return boardIndex;
        }
        return false;
    }

    async victoryCheck() {
        let winner;
        this.wins.map((check) => {
            let count = 0;
            let move;
            for (let i = 0; i < 3; i += 1) {
                if (i === 0) {
                    move = this.moves[check[i]];
                    if (!move) {
                        break;
                    }
                }
                if (move === this.moves[check[i]]) {
                    count += 1;
                }
            }
            if (count === 3) {
                winner = { player: move, moves: check };
            }
        });
        const moveCount = await this.movesCount();
        if (moveCount === 9) {
            winner = { player: 'draw' };
        }
        return winner;
    }
};
