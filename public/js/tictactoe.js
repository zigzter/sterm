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
            socket.emit('new-user', { username, userId });
        });
});

for (let i = 0; i < 9; i += 1) {
    const square = document.createElement('div');
    square.classList.add('square', 'd-flex', 'justify-content-center', 'align-items-center');
    square.id = `s${ i }`;
    $('#game').append(square);
}

$('#waiting').modal('show');

$('#makePublic').click(() => {
    fetch(`/games/${ roomId }`, { method: 'POST' });
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

socket.on('new-user', (user) => {
    socket.emit('start-game', { playerX: username, playerO: user.username });
});

socket.on('game-started', (players) => {
    const { playerX, playerO } = players;
    $('#feedback').append(`<p id="${ playerX }">${ playerX }</p><p id=${ playerO }>${ playerO }</p>`);
    $(`#${ playerX }`).addClass('currentplayer');
    $('.square').click((event) => {
        const squareId = event.target.id.slice(1);
        socket.emit('move', { squareId, username, userId });
    });
    $('#waiting').modal('hide');
    startTimer();
});

socket.on('valid-move', (moveObj) => {
    if (moveObj.playerMove === 'x') {
        $(`#s${ moveObj.squareId }`).html('<i class="fas fa-times fa-7x"></i>');
    } else if (moveObj.playerMove === 'o') {
        $(`#s${ moveObj.squareId }`).html('<i class="fas fa-dot-circle fa-6x"></i>');
    }
    $('#feedback p').slice(1).toggleClass('currentplayer');
    startTimer();
});

socket.on('victory', (data) => {
    const { player, moves } = data;
    if (username === player) {
        $('#victory').modal('show');
    } else {
        $('#loss').modal('show');
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
