exports.up = function(knex) {
    return knex.schema.createTable('users', function(table) {
        table.increments('id').primary();
        table.string('email', 255).unique().notNullable();
        table.string('password', 255).notNullable();
        table.string('firstName', 100).nullable();
        table.string('lastName', 100).nullable();
        table.date('dob').nullable();
        table.text('address').nullable();
        table.timestamps(true, true);

        // Index for faster email lookups
        table.index(['email']);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('users');
};