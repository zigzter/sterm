const gameContainer = document.querySelector('#game');
const resetGameButton = document.querySelector('#reset-game');
const socket = io.connect();
const roomId = location.pathname.split('/')[2];
const feedback = document.querySelector('.feedback').firstChild;
const chatroom = document.querySelector('#chatroom');
const sendMessage = document.querySelector('#send-message');
const message = document.querySelector('#message');
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
    // resetGame();
});

// document.addEventListener('DOMContentLoaded', () => {
//     $('#waiting').modal('show');
// })

socket.on('connect', () => {
    socket.emit('join-room', roomId);
    playerId = socket.id;
});

socket.on('valid-move', moveObj => {
    // update board
    document.querySelector(`#s${moveObj.squareId}`).innerHTML = moveObj.playerMove;
});

socket.on('invalid-move', msg => {
    // send warning/error
    console.log('stop cheating');
});

socket.on('victory', victor => {
    console.log(victor);
    $('#victory').modal('show');
});

socket.on('new-user', user => {
    console.log('new user connected');
    socket.emit('start-game', {playerO: user, playerX: socket.id})
});

socket.on('game-started', () => {
    $('#waiting').modal('hide')
    console.log('game started');
});

sendMessage.addEventListener('click', () => {
    const msg = message.value
    socket.emit('new-message', msg)
})

socket.on('new-message', msg => {
    const msgP = document.createElement('p');
    msgP.innerText = msg;
    chatroom.appendChild(msgP);
});