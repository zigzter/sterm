
exports.up = function(knex, Promise) {
  return knex.schema.table('games', t => {
      t.unique('room_id');
      t.dropColumn('winner');
      t.integer('winner_id').unsigned().references('users.id')
  })
};

exports.down = function(knex, Promise) {
  
};
