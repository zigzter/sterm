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
