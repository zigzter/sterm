
exports.up = function(knex, Promise) {
  return knex.schema.alterTable('users', t => {
      t.integer('wins').defaultTo(0).alter();
  })
};

exports.down = function(knex, Promise) {
  
};
