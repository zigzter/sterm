'use strict'; // eslint-disable-line

const shareLink = $('#shareLink');
const chatroom = $('#chatroom');
const message = $('#message');
const roomId = location.pathname.split('/')[2];
const socket = io({ transports: ['websocket'], upgrade: false });
let secondsElapsed = 0;
let username;
let timerId;
let userId;

socket.on('connect', () => {
    fetch('/users/vars').then(resp => resp.json())
        .then((data) => {
            ({ username, userId } = data);
            socket.emit('join-room', { roomId, userId, username });
            socket.emit('game-init', { roomId, userId, username });
        });
});

for (let i = 0; i < 9; i += 1) {
    const square = document.createElement('div');
    square.classList.add('square', 'd-flex', 'justify-content-center', 'align-items-center');
    square.id = `s${ i }`;
    $('#game').append(square);
}

// WAITING FOR PLAYER 2 MODAL =================================================

socket.on('waiting', () => {
    $('#waiting').modal('show');
});

$('#makePublic').click(() => {
    fetch(`/games/${ roomId }`, { method: 'PATCH' });
    $('#makePublic').prop('disabled', true);
    $('#makePublic').text('Game is public');
});

shareLink.click(() => {
    $('#roomLink').select();
    document.execCommand('copy');
    $('#roomLink').blur();
    shareLink.popover('show');
    setTimeout(() => {
        shareLink.popover('hide');
    }, 700);
});

// TIMER ======================================================================

function timer() {
    secondsElapsed += 1;
    $('#timer p').text(`Turn Timer: ${ secondsElapsed }`);
}
function startTimer() {
    clearInterval(timerId);
    secondsElapsed = 0;
    timerId = setInterval(timer, 1000);
}

// GAME =======================================================================

socket.on('game-started', (players) => {
    console.log('game started');
    const { player1, player2, p1username, p2username } = players;
    $('#feedback').append(`<p id="${ player1 }">${ p1username }: X</p><p id=${ player2 }>${ p2username }: O</p>`);
    $(`#${ player1 }`).addClass('currentplayer');
    $('.square').click((event) => {
        const squareId = event.currentTarget.id.slice(1);
        socket.emit('move', { squareId, username, userId, roomId });
    });
    $('#waiting').modal('hide');
    startTimer();
});

socket.on('valid-move', (moveData) => {
    const { squareId, moveUser, player1, player2 } = moveData;
    if (moveUser === player1) {
        $(`#s${ squareId }`).html('<i class="fas fa-times fa-7x"></i>');
    } else if (moveUser === player2) {
        $(`#s${ squareId }`).html('<i class="fas fa-dot-circle fa-6x"></i>');
    }
    $('#feedback p').slice(1).toggleClass('currentplayer');
    startTimer();
});

socket.on('game-over', (data) => {
    const { player, moves } = data;
    $('#gameOver').modal('show');
    if (userId === player) {
        $('#winner').text('You win!');
    } else if (player === 'draw') {
        $('#winner').text('Nobody wins!');
    } else {
        $('#winner').text('You lose!');
    }
    moves.map(index => $(`#s${ index }`).addClass('winningsquares'));
    $('#feedback p').removeClass('currentplayer');
    clearInterval(timerId);
    $('.square').off();
});

// CHAT =======================================================================

$('#send-message').click(() => {
    const msg = message.val();
    socket.emit('new-message', { msg, username, roomId });
    message.val('');
});

socket.on('new-message', (msgData) => {
    const msgP = $('<p>');
    const { msg, username } = msgData;
    msgP.html(`<strong>${ username }</strong>: ${ msg }`);
    msgP.addClass('message');
    chatroom.append(msgP);
    chatroom.scrollTop = chatroom.scrollHeight;
});

$(document).keypress((event) => {
    const keycode = (event.keyCode ? event.keyCode : event.which);
    if (keycode === 13) {
        $('#send-message').click();
    }
});
