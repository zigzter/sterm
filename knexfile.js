const commonConfig = {
    client: 'pg',
    connection: {
        database: 'sterm',
        username: 'ziggy',
        password: 'yeezy',
    },
    migrations: {
        tableName: 'migrations',
        directory: './db/migrations',
    }
}

module.exports = {
    development: {
        ...commonConfig,
    },
    production: {
        ...commonConfig,
        connection: process.env.DATABASE_URL,
    },
};
