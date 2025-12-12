const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'prisma', 'dev.db');
const sqlPath = path.join(__dirname, 'migrations', 'add_deutsche_post_settings.sql');

console.log('📦 Opening database:', dbPath);
const db = new sqlite3.Database(dbPath);

const sql = fs.readFileSync(sqlPath, 'utf8');
const statements = sql.split(';').filter(s => s.trim());

console.log(`🔧 Executing ${statements.length} SQL statements...`);

db.serialize(() => {
    statements.forEach((statement, index) => {
        if (statement.trim()) {
            db.run(statement, (err) => {
                if (err) {
                    console.error(`❌ Error in statement ${index + 1}:`, err.message);
                    console.error('Statement:', statement.trim());
                } else {
                    console.log(`✅ Statement ${index + 1} executed successfully`);
                }
            });
        }
    });
});

db.close((err) => {
    if (err) {
        console.error('❌ Error closing database:', err.message);
    } else {
        console.log('✅ Migration completed successfully!');
    }
});
