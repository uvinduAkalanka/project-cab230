const knex = require('knex');
const config = require('../knexfile');

const environment = process.env.NODE_ENV || 'development';
const db = knex(config[environment]);

db.raw('SELECT 1')
    .then(() => {
        console.log(' Database connected successfully');

        return db.raw('SHOW TABLES');
    })
    .then((result) => {
        const tables = result[0].map(row => Object.values(row)[0]);
        // console.log('Available tables:', tables);

        const requiredTables = ['users', 'refresh_tokens', 'basics'];
        const missingTables = requiredTables.filter(table => !tables.includes(table));

        if (missingTables.length > 0) {
            console.log('⚠Missing tables:', missingTables);
        } else {
            console.log('All required tables found');
        }
    })
    .catch((err) => {
        console.error(' Database connection failed:', err.message);
        console.error('Check your database credentials in .env file');
    });

module.exports = db;