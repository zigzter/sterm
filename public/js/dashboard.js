$('#refresh').click(e => {
    e.preventDefault();
    fetch('/games')
        .then(res => { return res.json() })
        .then(games => {
            $('.game').remove();
            let html = '';
            games.forEach(game => {
                const gameHTML = `
                <div class="card game">
                    <div class="card-body text-center">
                        <h5 class="card-title">${game.game_type.toUpperCase()}</h5>
                        <a href="/games/${game.room_id}"><i class="fas fa-th fa-5x"></i></a>
                    </div>
                </div>
                `
                html += gameHTML;
            });
            $('.card-columns').append(html)
        });
});