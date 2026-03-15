const knex = require('./db');
const logging = require('@tryghost/logging');

const STATE_TABLE = 'suar_custom_migrations';

async function ensureStateTable() {
    if (!await knex.schema.hasTable(STATE_TABLE)) {
        await knex.schema.createTable(STATE_TABLE, (t) => {
            t.increments('id');
            t.string('name').unique().notNullable();
            t.timestamp('executed_at').defaultTo(knex.fn.now());
        });
    }
    logging.info(`✅ Ensured state table: ${STATE_TABLE}`);
}

async function getExecutedMigrations() {
    if (!await knex.schema.hasTable(STATE_TABLE)) {
        return [];
    }
    const rows = await knex(STATE_TABLE).select('name');
    logging.info(`✅ Retrieved executed migrations: ${rows.length} found`);
    return rows.map(r => r.name);
}

module.exports = {STATE_TABLE, ensureStateTable, getExecutedMigrations};