const bcrypt = require('bcrypt');
const knex = require('../db/client');

module.exports = class User {
    constructor({ id, username, email, password, password_digest, wins }) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.password_digest = password_digest;
        this.wins = wins;
    }

    static async find(id) {
        const userRaw = await knex('users').where({ id }).first();
        return new User(userRaw);
    }

    static async findByUsername(username) {
        const userRaw = await knex('users').where({ username }).first();
        return new User(userRaw);
    }

    addWin() {
        knex('users').where({ id: this.id }).increment('wins', 1).then();
    }

    async save() {
        const { username, email, password } = this;
        const [{ id }] = await knex('users').insert({
            username,
            email,
            password_digest: await bcrypt.hash(password, 10),
        }).returning('*');
        this.id = id;
        return this;
    }

    async authenticate(password) {
        return bcrypt.compare(password, this.password_digest);
    }
};
