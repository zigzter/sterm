const gameContainer = document.querySelector('#game');
const resetGameButton = document.querySelector('#reset-game');
let gameOver = false;
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

for(let i = 0; i < 9; i += 1){
    const square = document.createElement('div');
    square.classList.add('square');
    gameContainer.appendChild(square);
}

const squares = document.querySelectorAll('.square')

squares.forEach(square => {
    square.addEventListener('click', event => {
        if(!gameOver){
                square.innerHTML = '<i class="fas fa-times fa-5x"></i>';
                victoryCheck();
        }
    });
});

resetGameButton.addEventListener('click', () => {
    resetGame();
})

function victoryCheck(){
    let count;
    for(let check of wins){
        count = 0;
        for(let val of check){
            if(squares[val].innerHTML){
                count += 1;
            }
        }
        if(count === 3){
            console.log("YOU WON")
            $('#victory').modal('show')
            gameOver = true;
            return;
        }
    }
}

function resetGame(){
    squares.forEach(square => {
        square.innerHTML = '';
        gameOver = false;
    });
}