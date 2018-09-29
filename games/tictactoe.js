
module.exports = class TicTacToe {
    constructor(id1, id2){
        this.playerX = id1;
        this.playerO = id2;
        this.currentPlayer = id1;
        this.moves = Array(9);
        this.wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    }
    addMove(boardIndex, id){
        // console.log('current:', this.currentPlayer);
        // console.log('player X:', this.playerX);
        // console.log('player O:', this.playerO);
        // console.log('=========================')
        if(this.currentPlayer === id && this.moves[boardIndex] === undefined){
            if(this.currentPlayer === this.playerX){
                this.moves[boardIndex] = 'x';
                this.currentPlayer = this.playerO;
                return 'x';
            } else if(this.currentPlayer === this.playerO){
                this.moves[boardIndex] = 'o';
                this.currentPlayer = this.playerX;
                return 'o';
            }
        } else {
            // prevent cheating and send warning to user
            return false
        }
    }
    victoryCheck(){
        for(let check of this.wins){
            let count = 0;
            let move;
            for(let i = 0; i < 3; i += 1){
                if(i === 0){
                    move = this.moves[check[i]];
                    if(!move){
                        break;
                    }
                    count = 1;
                }else if(move === this.moves[check[i]]){
                    count += 1;
                }
            }
            if(count === 3){
                console.log(`${move} wins`);
                return move;
            }
        }
    }
}
