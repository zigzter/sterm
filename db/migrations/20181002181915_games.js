
exports.up = function(knex, Promise) {
  return knex.schema.createTable('games', t => {
      t.increments('id');
      t.string('room_id');
      t.integer('player1').unsigned().references('users.id');
      t.integer('player2').unsigned().references('users.id');
      t.boolean('is_public').defaultTo(false);
      t.integer('winner');
      t.string('game_type');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('games');
};
