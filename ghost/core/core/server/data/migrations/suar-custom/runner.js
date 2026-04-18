const path = require('path');
const fs = require('fs');
const logging = require('@tryghost/logging');
const knex = require('./db');
const {ensureStateTable, getExecutedMigrations} = require('./state');
const {shouldSkipMigration} = require('./checker');

const CUSTOM_MIGRATIONS_PATH = path.join(__dirname, 'versions');

async function runMigrations(specificFile) {
    if (await shouldSkipMigration()) {
        return logging.info('All custom migrations skipped');
    }

    await ensureStateTable();
    const executed = await getExecutedMigrations();
    let files = fs.readdirSync(CUSTOM_MIGRATIONS_PATH)
        .filter(f => f.endsWith('.js'))
        .sort();

    if (specificFile) {
        // hanya jalankan file tertentu jika diberikan
        files = files.filter(f => f === specificFile);
        if (files.length === 0) {
            return logging.warn(`Migration file not found: ${specificFile}`);
        }
    }

    for (const f of files) {
        if (executed.includes(f)) {
            logging.info(`Skipping executed migration: ${f}`);
            continue;
        }
        logging.info(`Running migration: ${f}`);
        await require(path.join(CUSTOM_MIGRATIONS_PATH, f)).up(knex);
        await knex('suar_custom_migrations').insert({name: f});
    }

    logging.info('✅ Custom migrations finished');
}

module.exports = runMigrations;