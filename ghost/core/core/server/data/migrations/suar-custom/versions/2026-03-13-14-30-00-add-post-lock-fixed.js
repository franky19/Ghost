const logging = require('@tryghost/logging');

module.exports.up = async function (knex) {
    const hasTable = await knex.schema.hasTable('suar_post_lock');

    if (!hasTable) {
        const postsExists = await knex.schema.hasTable('posts');
        const usersExists = await knex.schema.hasTable('users');

        await knex.schema.createTable('suar_post_lock', (table) => {
            table.string('id', 24).primary();
            table.string('post_id', 24).notNullable();
            table.string('user_id', 24).nullable();

            // ✅ Paling kompatibel untuk MySQL lama & baru
            table.timestamp('locked_at')
                .notNullable()
                .defaultTo(knex.raw('CURRENT_TIMESTAMP'));

            table.index('post_id');
            table.index('user_id');

            if (postsExists) {
                table.foreign('post_id')
                    .references('id')
                    .inTable('posts')
                    .onDelete('CASCADE');
            }

            if (usersExists) {
                table.foreign('user_id')
                    .references('id')
                    .inTable('users')
                    .onDelete('SET NULL');
            }
        });

        logging.info('✅ Created suar_post_lock table');
    }
};