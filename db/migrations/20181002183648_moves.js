
exports.up = function(knex, Promise) {
  return knex.schema.createTable('moves', t => {
      t.increments('id');
      t.integer('game_id').unsigned().references('games.id');
      t.integer('user_id').unsigned().references('users.id');
      t.string('move');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('moves');
};
