exports.up = function(knex) {
    return knex.schema.createTable('refresh_tokens', function(table) {
        table.increments('id').primary();
        table.string('token', 500).unique().notNullable();
        table.integer('user_id').unsigned().notNullable();
        table.datetime('expires_at').notNullable();
        table.timestamps(true, true);

        // Foreign key constraint
        table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');

        // Index for faster token lookups
        table.index(['token']);
        table.index(['user_id']);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('refresh_tokens');
};