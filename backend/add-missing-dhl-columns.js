const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'prisma', 'dev.db');
console.log('📦 Adding missing DHL GKP columns to:', dbPath);

const db = new sqlite3.Database(dbPath);

const sqls = [
    "ALTER TABLE user_settings ADD COLUMN dhlGkpUsername TEXT",
    "ALTER TABLE user_settings ADD COLUMN dhlGkpPassword TEXT",
    "ALTER TABLE user_settings ADD COLUMN dhlEnabled INTEGER NOT NULL DEFAULT 0"
];

db.serialize(() => {
    sqls.forEach((sql, i) => {
        db.run(sql, (err) => {
            if (err) {
                if (err.message.includes('duplicate')) {
                    console.log(`${i+1}. ⚠️  Already exists`);
                } else {
                    console.error(`${i+1}. ❌ ERROR:`, err.message);
                }
            } else {
                const colName = sql.split('ADD COLUMN ')[1].split(' ')[0];
                console.log(`${i+1}. ✅ ADDED: ${colName}`);
            }
            
            if (i === sqls.length - 1) {
                console.log('\n🔍 Verifying...');
                db.all("PRAGMA table_info(user_settings)", [], (err, rows) => {
                    const dhlCols = rows.filter(r => r.name.toLowerCase().includes('dhl'));
                    console.log(`\n✅ Total DHL columns now: ${dhlCols.length}`);
                    dhlCols.forEach(c => console.log(`  - ${c.name}`));
                    db.close();
                    console.log('\n✅ DONE! Restart backend now.');
                });
            }
        });
    });
});
