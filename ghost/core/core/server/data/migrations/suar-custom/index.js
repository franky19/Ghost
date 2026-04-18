const logging = require('@tryghost/logging');
const runMigrations = require('./runner');

module.exports = async function runSuarCustomMigrations() {
    try {
        // hanya jalankan file migrasi tertentu
        await runMigrations('2026-03-13-14-30-00-add-post-lock-fixed.js');
    } catch (err) {
        logging.error('Migration runner error:', err);
        process.exit(1);
    }
};