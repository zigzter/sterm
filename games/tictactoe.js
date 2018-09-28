const moves = Array.apply(null, Array(9)).map(() => {});
let gameOver = false;
let playerMoves = 0;
let currentPlayer = 1;

const wins = [
    [0,1,2],
    [3,4,5],
    [6,7,8],
    [0,3,6],
    [1,4,7],
    [2,5,8],
    [0,4,8],
    [2,4,6]
];

function addMove(boardIndex){
    // only proceed with the move if it's the player's first move of the turn and the move doesn't already exist
    if(playerMoves <= 1 && moves[boardIndex] === undefined){
        // add move to moves
    } else {
        // prevent cheating and send warning to user
    }
}

function victoryCheck(){
    for(let check of wins){
        let count = 0;
        let move;
        for(let i = 0; i < 3; i += 1){
            if(i === 0){
                move = moves[check[i]];
                if(!move){
                    break;
                }
                count = 1;
            }else if(move === moves[check[i]]){
                count += 1;
            }
        }
        if(count === 3){
            console.log(`${move} wins`);
        }
    }
}

function moveTest(move){
    console.log(move);
}

module.exports = {
    addMove,
    victoryCheck,
    moveTest
}

