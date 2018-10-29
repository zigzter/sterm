
exports.up = function(knex, Promise) {
  return knex.schema.table('games', t => {
      t.string('game_state');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.table('games', t => {
      t.dropColumn('game_state');
  })
};
