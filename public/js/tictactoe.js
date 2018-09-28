const gameContainer = document.querySelector('#game');
const resetGameButton = document.querySelector('#reset-game');
const socket = io.connect();
const roomId = location.pathname.split('/')[2];

for(let i = 0; i < 9; i += 1){
    const square = document.createElement('div');
    square.classList.add('square');
    gameContainer.appendChild(square);
}

const squares = document.querySelectorAll('.square')

squares.forEach(square => {
    square.addEventListener('click', event => {
        // put socket.io logic
        socket.emit('move', 'HELLO');
    });
});

resetGameButton.addEventListener('click', () => {
    resetGame();
});

function resetGame(){
    squares.forEach(square => {
        square.innerHTML = '';
        gameOver = false;
    });
}

socket.on('connect', () => {
    socket.emit('join-room', roomId);
});

socket.on('valid-move', move => {
    // update board
});

socket.on('invalid-move', msg => {
    // send warning/error
});