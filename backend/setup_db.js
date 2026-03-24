import pool from './db/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const setupDb = async () => {
    try {
        const schemaPath = path.join(__dirname, 'db', 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        console.log('Running schema...');
        await pool.query(schema);

        // Check if admin exists
        const res = await pool.query('SELECT * FROM admins WHERE username = $1', ['admin']);
        if (res.rows.length === 0) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('admin123', salt);
            await pool.query('INSERT INTO admins (username, password) VALUES ($1, $2)', ['admin', hashedPassword]);
            console.log('Default admin created: admin / admin123');
        }

        console.log('Database setup complete!');
        process.exit();
    } catch (error) {
        console.error('Error setting up DB:', error);
        process.exit(1);
    }
};

setupDb();
