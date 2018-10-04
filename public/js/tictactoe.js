'use strict';
const shareLink       = $('#shareLink');
const feedback        = $('#feedback');
const chatroom        = $('#chatroom');
const message         = $('#message');
const roomUrl         = location.href;
const roomId          = location.pathname.split('/')[2];
const socket          = io.connect();
let playerId, user_id, username;

fetch('/users/vars').then(resp => {
    return resp.json();
}).then(data => {
    username = data.username;
    user_id = data.user_id;
    socket.emit('new-user', { username, user_id });
});

for(let i = 0; i < 9; i += 1){
    const square = document.createElement('div');
    square.classList.add('square', 'd-flex', 'justify-content-center', 'align-items-center');
    square.id = 's' + i;
    $('#game').append(square);
}

$('.square').click(event => {
    const squareId = event.target.id.slice(1);
    socket.emit('move', {squareId, playerId});
});

document.addEventListener('DOMContentLoaded', () => {
    $('#waiting').modal('show');
    $(document).keypress(function(event){
        let keycode = (event.keyCode ? event.keyCode : event.which);
        if(keycode == '13'){
            $('#send-message').click();   
        }
    });
    $('#makePublic').click(() => {
        fetch(`/games/${roomId}`, { method: 'POST' });
        $('#makePublic').prop('disabled', true);
        $('#makePublic').text('Game is public');
    });
});

shareLink.click(() => {
    roomLink.select();
    document.execCommand("copy");
    roomLink.blur();
    shareLink.popover('show');
    setTimeout(() => {
        shareLink.popover('hide');
    }, 700);
});

function timer(){
    let secondsElapsed = 0;
    setInterval(() => {
        seconds += 1;
    }, 1000);
}

// GAME =======================================================================

socket.on('connect', () => {
    socket.emit('join-room', roomId);
    playerId = socket.id;
});

socket.on('valid-move', moveObj => {
    if(moveObj.playerMove === 'x'){
        $(`#s${moveObj.squareId}`).html('<i class="fas fa-times fa-7x"></i>');
    } else if(moveObj.playerMove === 'o'){
        $(`#s${moveObj.squareId}`).html('<i class="far fa-circle fa-7x"></i>');
    }
});

socket.on('invalid-move', msg => {
    console.log('stop cheating');
});

socket.on('victory', victor => {
    if(playerId === victor){
        $('#victory').modal('show');
    } else {
        $('#loss').modal('show');
    }
});

socket.on('new-user', user => {
    console.log('new user connected');
    socket.emit('start-game', {playerO: user, playerX: socket.id})
});

socket.on('game-started', players => {
    const { playerX, playerO } = players;
    feedback.html(
        `<p>${playerX.slice(15)}</p>
        <p>${playerO.slice(15)}</p>`
    )
    $('#waiting').modal('hide')
    console.log('game started');
});

// CHAT =======================================================================

sendMessage.click(() => {
    const msg = message.val();
    socket.emit('new-message', { msg, playerId });
    message.val('');
});

socket.on('new-message', msgData => {
    const msgP = $('<p>');
    const { msg, playerId } = msgData;
    msgP.html(`<strong>${playerId.slice(15)}</strong>: ${msg}`);
    msgP.addClass('message');
    chatroom.append(msgP);
    chatroom.scrollTop = chatroom.scrollHeight;
});

