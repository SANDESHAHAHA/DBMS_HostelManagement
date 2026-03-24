import pool from './db/index.js';
import bcrypt from 'bcryptjs';

async function run() {
    try {
        const hash = await bcrypt.hash('admin123', 10);
        await pool.query("INSERT INTO admins (username, password) VALUES ('admin', $1) ON CONFLICT (username) DO UPDATE SET password = $1", [hash]);
        console.log("Admin created/updated successfully with password: admin123");
    } catch(e) {
        console.error(e);
    }
}
export default run;