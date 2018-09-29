const gameContainer = document.querySelector('#game');
const resetGameButton = document.querySelector('#reset-game');
const socket = io.connect();
const roomId = location.pathname.split('/')[2];
let playerId;

for(let i = 0; i < 9; i += 1){
    const square = document.createElement('div');
    square.classList.add('square');
    square.id = 's' + i;
    gameContainer.appendChild(square);
}

const squares = document.querySelectorAll('.square');

squares.forEach(square => {
    square.addEventListener('click', event => {
        squareId = event.target.id.slice(1);
        socket.emit('move', {squareId, playerId});
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
    playerId = socket.id;
});

socket.on('valid-move', moveObj => {
    // update board
    console.log('valid');
    document.querySelector(`#s${moveObj.move}`).innerHTML = moveObj.playerMove;

});

socket.on('invalid-move', msg => {
    // send warning/error
    console.log('stop cheating');
});

socket.on('victory', victor => {
    // send warning/error
    $('#victory').modal('show');
});
