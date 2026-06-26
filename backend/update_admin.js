require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

(async () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const hash = await bcrypt.hash('20102010', 10);
    await pool.query(
      'UPDATE users SET email = $1, password = $2 WHERE username = $3',
      ['ibrahimseleme0@gmail.com', hash, 'admin']
    );
    console.log('Admin updated successfully');

    const r = await pool.query('SELECT email, role FROM users WHERE username = $1', ['admin']);
    console.log('Result:', r.rows[0]);
  } catch (err) {
    console.error('Error:', err.message);
  }
  await pool.end();
})();
