const Game = require('../models/game');
const knex = require('../db/client');

module.exports = class Connect4 extends Game {
    constructor({ id, room_id, player1, player2, is_public, game_type, winner_id }) {
        super({ id, room_id, player1, player2, is_public, game_type, winner_id });
        this.board = [...Array(6)].map(() => Array(7).fill('0'));
    }

    async addMove(col, userId) {
        const lastMove = await Game.lastMove(this.id);
        let lastUser = this.player2;
        if (lastMove) {
            lastUser = lastMove.user_id;
        }
        const moves = await knex('moves').where({ game_id: this.id });
        moves.forEach((o) => {
            const { move, user_id } = o;
            const [ r, c ] = move.split(',');
            this.board[r][c] = user_id;
        });
        if (userId !== lastUser) {
            for (let i = 0; i < this.board.length; i += 1) {
                if (i === 0 && this.board[i][col] !== '0') {
                    return false;
                }
                if (this.board[i + 1]) {
                    if (this.board[i + 1][col] !== '0') {
                        this.board[i][col] = userId;
                        Game.saveMove(this.id, userId, `${ i },${ col }`);
                        return { row: i, col: Number(col) };
                    }
                } else  {
                    this.board[i][col] = userId;
                    Game.saveMove(this.id, userId, `${ i },${ col }`);
                    return { row: i, col: Number(col) };
                }
            }
        }
        return false;
    }

    chkLine(a, b, c, d) {
        return ((a != 0) && (a == b) && (a == c) && (a == d));
    }

    victoryCheck() {
        let winner;
        const bd = this.board;
        for (let r = 0; r < 3; r += 1) {
            for (let c = 0; c < 7; c += 1) {
                if (this.chkLine(bd[r][c], bd[r+1][c], bd[r+2][c], bd[r+3][c])) {
                    winner = {
                        player: bd[r][c],
                        moves: [[r,c], [r+1,c], [r+2,c], [r+3,c]],
                    };
                }
            }
        }
        for (let r = 0; r < 6; r += 1) {
            for (let c = 0; c < 4; c += 1) {
                if (this.chkLine(bd[r][c], bd[r][c+1], bd[r][c+2], bd[r][c+3])) {
                    winner = {
                        player: bd[r][c],
                        moves: [[r,c], [r,c+1], [r,c+2], [r,c+3]],
                    };
                }
            }
        }
        for (let r = 0; r < 3; r += 1) {
            for (let c = 0; c < 4; c += 1) {
                if (this.chkLine(bd[r][c], bd[r+1][c+1], bd[r+2][c+2], bd[r+3][c+3])) {
                    winner = {
                        player: bd[r][c],
                        moves: [[r,c], [r+1,c+1], [r+2,c+2], [r+3,c+3]],
                    };
                }
            }
        }
        for (let r = 3; r < 6; r += 1) {
            for (let c = 0; c < 4; c += 1) {
                if (this.chkLine(bd[r][c], bd[r-1][c+1], bd[r-2][c+2], bd[r-3][c+3])) {
                    winner = {
                        player: bd[r][c],
                        moves: [[r,c], [r-1,c+1], [r-2,c+2], [r-3,c+3]],
                    };
                }
            }
        }
        return winner;
    }
};
