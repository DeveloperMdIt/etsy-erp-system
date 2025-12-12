// Direct SQL migration for DHL fields
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
const db = new Database(dbPath);

console.log('📦 Opening database:', dbPath);

const migrations = [
    'ALTER TABLE user_settings ADD COLUMN dhlGkpUsername TEXT',
    'ALTER TABLE user_settings ADD COLUMN dhlGkpPassword TEXT',
    'ALTER TABLE user_settings ADD COLUMN dhlEnabled INTEGER NOT NULL DEFAULT 0',
    'ALTER TABLE user_settings ADD COLUMN printerDHL TEXT'
];

migrations.forEach((sql, index) => {
    try {
        console.log(`\n${index + 1}. Executing: ${sql}`);
        db.exec(sql);
        console.log('   ✅ Success');
    } catch (error: any) {
        if (error.message.includes('duplicate column')) {
            console.log('   ⚠️  Column already exists (OK)');
        } else {
            console.error('   ❌ Error:', error.message);
        }
    }
});

// Verify columns exist
console.log('\n🔍 Verifying columns...');
const tableInfo = db.prepare('PRAGMA table_info(user_settings)').all();
const dhlColumns = tableInfo.filter((col: any) => col.name.startsWith('dhl') || col.name === 'printerDHL');

console.log('\nDHL columns found:');
dhlColumns.forEach((col: any) => {
    console.log(`  ✅ ${col.name} (${col.type})`);
});

if (dhlColumns.length === 4) {
    console.log('\n✅ All DHL columns exist!');
} else {
    console.log(`\n❌ Expected 4 columns, found ${dhlColumns.length}`);
}

db.close();
