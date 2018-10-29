const knex = require('../db/client');

module.exports = class Game {
    constructor({ id, room_id, player1, player2, is_public, game_type, winner_id, game_state }) {
        this.id = id;
        this.room_id = room_id;
        this.player1 = player1;
        this.player2 = player2;
        this.is_public = is_public;
        this.game_type = game_type;
        this.winner_id = winner_id;
        this.game_state = game_state;
    }

    static async findPublicGames() {
        return knex('games').where({ is_public: true }).whereNull('game_state');
    }

    static async setPublic(room_id) {
        return knex('games').where({ room_id }).update({ is_public: true }).then();
    }

    static async fetch(room_id) {
        return knex('games').where({ room_id }).first();
    }
    
    static async saveMove(game_id, user_id, move) {
        await knex('moves').insert({
            game_id,
            user_id,
            move,
        });
        return this;
    }

    static async update(room_id, game_state) {
        return knex('games').where({ room_id }).update({ game_state }).then();
    }

    static async lastMove(game_id) {
        return knex('moves').where({ game_id }).orderBy('created_at', 'desc').first();
    }

    static async setWinner(room_id, winner_id) {
        return knex('games').where({ room_id }).update({ winner_id }).then();
    }

    async fetchMoves() {
        this.dbMoves = await knex('moves').where({ game_id: this.id });
        this.dbMoves.map((move) => {
            this.moves[move.move] = move.user_id;
        });
    }

    async movesCount() {
        const moves = await knex('moves').where({ game_id: this.id });
        return moves.length;
    }

    async setPlayer2(player2) {
        await knex('games').where({ id: this.id }).update({ player2 }).then();
    }

    async save() {
        const { room_id, player1, game_type } = this;
        const [{ id }] = await knex('games').insert({
            room_id,
            player1,
            game_type
        }).returning('*');
        this.id = id;
        return this;
    }
};
