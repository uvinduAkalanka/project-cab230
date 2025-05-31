require('dotenv').config();

module.exports = {
    development: {
        client: 'mysql2',
        connection: {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'root!',
            database: process.env.DB_NAME || 'movies'
        },
        migrations: {
            directory: './migrations',
            tableName: 'knex_migrations'
        },
        pool: {
            min: 2,
            max: 10
        }
    },

    production: {
        client: 'mysql2',
        connection: {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'root!',
            database: process.env.DB_NAME || 'movies'
        },
        migrations: {
            directory: './migrations',
            tableName: 'knex_migrations'
        },
        pool: {
            min: 2,
            max: 10
        }
    }
};