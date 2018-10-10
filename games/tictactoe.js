
module.exports = class TicTacToe {
    constructor(id1, id2) {
        this.playerX = id1;
        this.playerO = id2;
        this.currentPlayer = id1;
        this.moves = Array(9);
        this.wins = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
    }

    addMove(boardIndex, username) {
        if (this.currentPlayer === username && this.moves[boardIndex] === undefined) {
            if (this.currentPlayer === this.playerX) {
                this.moves[boardIndex] = 'x';
                this.currentPlayer = this.playerO;
                return 'x';
            }
            if (this.currentPlayer === this.playerO) {
                this.moves[boardIndex] = 'o';
                this.currentPlayer = this.playerX;
                return 'o';
            }
        } else {
            return false;
        }
    }

    victoryCheck() {
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
                if (move === 'x') {
                    winner = { player: this.playerX, moves: check };
                }
                if (move === 'o') {
                    winner = { player: this.playerO, moves: check };
                }
            }
        });
        return winner;
    }
};
