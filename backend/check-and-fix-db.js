const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'prisma', 'dev.db');
console.log('📦 Database:', dbPath);

const db = new sqlite3.Database(dbPath);

// Get table schema
db.all("PRAGMA table_info(user_settings)", [], (err, rows) => {
    if (err) {
        console.error('❌ Error:', err);
        return;
    }
    
    console.log('\n📋 user_settings columns:');
    console.log('Total:', rows.length);
    
    const dhlCols = rows.filter(r => r.name.toLowerCase().includes('dhl'));
    console.log('\nDHL columns:', dhlCols.length);
    
    if (dhlCols.length === 0) {
        console.log('\n❌ NO DHL COLUMNS FOUND!');
        console.log('\n🔧 Adding columns NOW...\n');
        
        const sqls = [
            "ALTER TABLE user_settings ADD COLUMN dhlGkpUsername TEXT",
            "ALTER TABLE user_settings ADD COLUMN dhlGkpPassword TEXT",
            "ALTER TABLE user_settings ADD COLUMN dhlEnabled INTEGER NOT NULL DEFAULT 0",
            "ALTER TABLE user_settings ADD COLUMN printerDHL TEXT"
        ];
        
        db.serialize(() => {
            sqls.forEach((sql, i) => {
                db.run(sql, (err) => {
                    if (err) {
                        if (err.message.includes('duplicate')) {
                            console.log(`${i+1}. ⚠️  Column exists:`, sql.split('ADD COLUMN ')[1].split(' ')[0]);
                        } else {
                            console.error(`${i+1}. ❌ Error:`, err.message);
                        }
                    } else {
                        console.log(`${i+1}. ✅ Added:`, sql.split('ADD COLUMN ')[1].split(' ')[0]);
                    }
                    
                    if (i === sqls.length - 1) {
                        // Verify
                        db.all("PRAGMA table_info(user_settings)", [], (err, newRows) => {
                            const newDhl = newRows.filter(r => r.name.toLowerCase().includes('dhl'));
                            console.log('\n✅ Final DHL columns:', newDhl.length);
                            newDhl.forEach(c => console.log(`  - ${c.name}`));
                            db.close();
                        });
                    }
                });
            });
        });
    } else {
        console.log('\n✅ DHL columns found:');
        dhlCols.forEach(c => console.log(`  - ${c.name} (${c.type})`));
        db.close();
    }
});
