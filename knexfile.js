// Update with your config settings.

module.exports = {

  development: {
    client: 'pg',
    connection: {
      database: 'sterm',
      username: 'ziggy',
      password: 'yeezy'
    },
    migrations: {
      tableName: 'migrations',
      directory: './db/migrations'
    }
  }

};
