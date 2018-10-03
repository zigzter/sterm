
exports.up = function(knex, Promise) {
  return knex.schema.createTable('messages', t => {
    t.integer('game_id').unsigned().references('games.id');
    t.integer('user_id').unsigned().references('users.id');
    t.text('content');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('messages');
};
