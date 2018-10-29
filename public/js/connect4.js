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

$('#game').append($('<div>').attr('id', 'dropZone').addClass('d-flex'));

for (let i = 0; i < 7; i += 1) {
    const dropChoice = document.createElement('div');
    dropChoice.classList.add('dropChoice', 'd-flex', 'justify-content-center', 'align-items-center');
    dropChoice.id = `d${i}`;
    dropChoice.innerHTML = '<i class="fas fa-circle fa-3x"></i>';
    $('#dropZone').append(dropChoice);
}

for (let i = 0; i < 6; i += 1) {
    const row = document.createElement('div');
    row.classList.add('d-flex', 'crow');
    row.id = `r${ i }`;
    for (let i = 0; i < 7; i += 1) {
        const square = document.createElement('div');
        square.classList.add('csquare', 'd-flex', 'justify-content-center', 'align-items-center');
        square.id = `c${ i }`;
        row.append(square);
    }
    $('#game').append(row);
}

$('#game').removeAttr('id');

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
    const { player1, player2, p1username, p2username } = players;
    $('#feedback').append(`<p id="${ player1 }">${ p1username }: Red</p><p id=${ player2 }>${ p2username }: Blue</p>`);
    $(`#${ player1 }`).addClass('currentplayer');
    $('.dropChoice').addClass((userId === player1) ? 'red' : 'blue')
    $('.dropChoice').click((event) => {
        const squareId = event.currentTarget.id.slice(1);
        socket.emit('move', { squareId, username, userId, roomId });
    });
    $('#waiting').modal('hide');
    startTimer();
});

socket.on('valid-move', (moveData) => {
    const { moveUser, player1, player2, validMove } = moveData;
    const { row, col } = validMove;
    if (moveUser === player1) {
        $(`#r${ row } #c${ col }`).html('<i class="fas fa-circle fa-3x"></i>');
        $(`#r${ row } #c${ col }`).addClass('red');
    } else if (moveUser === player2) {
        $(`#r${ row } #c${ col }`).html('<i class="fas fa-circle fa-3x"></i>');
        $(`#r${ row } #c${ col }`).addClass('blue');
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
    moves.forEach((loc) => {
        $(`#r${ loc[0] } #c${ loc[1] }`).addClass('c4wins');
    });
    $('#feedback p').removeClass('currentplayer');
    clearInterval(timerId);
    $('.dropChoice').off();
});

// CHAT =======================================================================

$('#send-message').click(() => {
    const msg = message.val();
    if (msg.startsWith('/msg')) {
        const author = username;
        const [ cmd, recip, ...messageArray ] = msg.split(' ');
        const pmMessage = messageArray.join(' ');
        const msgP = $('<p>');
        msgP.html(`Sent to ${ recip }: ${ pmMessage }`);
        msgP.addClass('privateMessage');
        chatroom.append(msgP);
        chatroom.scrollTop(chatroom.prop('scrollHeight'));
        message.val('');
        return socket.emit('private-message', { recip, pmMessage, author });
    }
    socket.emit('new-message', { msg, username, roomId });
    message.val('');
});

socket.on('new-message', (msgData) => {
    const msgP = $('<p>');
    const { msg, username } = msgData;
    msgP.html(`<strong>${ username }</strong>: ${ msg }`);
    msgP.addClass('message');
    chatroom.append(msgP);
    chatroom.scrollTop(chatroom.prop('scrollHeight'));
});

$(document).keypress((event) => {
    const keycode = (event.keyCode ? event.keyCode : event.which);
    if (keycode === 13) {
        $('#send-message').click();
    }
});

socket.on('private-message', ({ pmMessage, author }) => {
    const msgP = $('<p>');
    msgP.html(`Whisper from <span class="pmAuthor">${ author }</span>: ${ pmMessage }`);
    msgP.addClass('privateMessage');
    chatroom.append(msgP);
    $('.pmAuthor').click(() => {
        message.val(`/msg ${ author } `);
        message.focus();
    });
    chatroom.scrollTop(chatroom.prop('scrollHeight'));
});

socket.on('no-user', () => {
    const msgP = $('<p>');
    msgP.html('<strong>Server</strong>: User is offline or does not exist');
    msgP.addClass('privateMessage');
    chatroom.append(msgP);
    chatroom.scrollTop(chatroom.prop('scrollHeight'));
});
