// Verify and fix database schema
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'prisma', 'dev.db');

if (!fs.existsSync(dbPath)) {
    console.error('❌ Database not found:', dbPath);
    process.exit(1);
}

const db = new Database(dbPath);

console.log('📦 Database:', dbPath);
console.log('\n🔍 Current user_settings schema:');

const tableInfo = db.prepare('PRAGMA table_info(user_settings)').all();
console.log('Total columns:', tableInfo.length);

const dhlColumns = tableInfo.filter(col => 
    col.name.toLowerCase().includes('dhl') || col.name === 'printerDHL'
);

console.log('\n📋 DHL-related columns:');
if (dhlColumns.length === 0) {
    console.log('  ❌ No DHL columns found!');
    console.log('\n🔧 Adding DHL columns...\n');
    
    const migrations = [
        'ALTER TABLE user_settings ADD COLUMN dhlGkpUsername TEXT',
        'ALTER TABLE user_settings ADD COLUMN dhlGkpPassword TEXT',
        'ALTER TABLE user_settings ADD COLUMN dhlEnabled INTEGER NOT NULL DEFAULT 0',
        'ALTER TABLE user_settings ADD COLUMN printerDHL TEXT'
    ];
    
    migrations.forEach((sql, i) => {
        try {
            console.log(`${i + 1}. ${sql}`);
            db.exec(sql);
            console.log('   ✅ Success');
        } catch (error) {
            if (error.message.includes('duplicate')) {
                console.log('   ⚠️  Already exists');
            } else {
                console.error('   ❌ Error:', error.message);
            }
        }
    });
    
    // Verify again
    const newTableInfo = db.prepare('PRAGMA table_info(user_settings)').all();
    const newDhlColumns = newTableInfo.filter(col => 
        col.name.toLowerCase().includes('dhl') || col.name === 'printerDHL'
    );
    
    console.log('\n✅ Final DHL columns:', newDhlColumns.length);
    newDhlColumns.forEach(col => {
        console.log(`  - ${col.name} (${col.type})`);
    });
} else {
    dhlColumns.forEach(col => {
        console.log(`  ✅ ${col.name} (${col.type})`);
    });
}

db.close();
console.log('\n✅ Done!');
