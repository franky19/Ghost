const knex = require('./db');
const logging = require('@tryghost/logging');

const TABLES_TO_SKIP = ['suar_post_lock'];

async function shouldSkipMigration() {
    for (const t of TABLES_TO_SKIP) {
        if (await knex.schema.hasTable(t)) {
            logging.info(`✅ Table "${t}" exists. Skipping all migrations.`);
            return true;
        }
    }
    return false;
}

module.exports = {shouldSkipMigration};