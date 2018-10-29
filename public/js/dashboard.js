const socket = io({ transports: ['websocket'], upgrade: false });
const chatroom = $('#chatroom');
const message = $('#message');
const roomId = 'global';
let username;
let userId;

socket.on('connect', () => {
    fetch('/users/vars').then(resp => resp.json())
        .then((data) => {
            ({ username, userId } = data);
            socket.emit('join-room', { roomId, userId, username });
        });
});

$('#refresh').click((e) => {
    e.preventDefault();
    fetch('/games')
        .then(res => { return res.json() })
        .then((games) => {
            $('.game').remove();
            let html = '';
            games.forEach((game) => {
                const gameHTML = `
                <div class="card game">
                    <div class="card-body text-center">
                        <h5 class="card-title">${game.game_type.toUpperCase()}</h5>
                        <a href="/games/${game.room_id}"><i class="fas fa-th fa-5x"></i></a>
                    </div>
                </div>
                `;
                html += gameHTML;
            });
            $('.card-columns').append(html);
        });
});

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

socket.on('new-user', ({ users }) => {
    $('#users').html('');
    users.map((user) => {
        $('#users').append(`<p class="user" id="${ user }">${ user }</p>`);
        $(`#${ user }`).click(() => {
            message.val(`/msg ${ user } `);
            message.focus();
        });
    });
});

socket.on('user-left', ({ discUser }) => {
    document.getElementById(discUser).remove();
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
    chatroom.scrollTop = chatroom.scrollHeight;
});
