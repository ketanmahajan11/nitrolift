// File: server.js
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: 'https://nitroliftsupports.onrender.com'  // Replace with your GitHub Pages URL
}));
app.use(express.json());

// PostgreSQL connection setup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Initialize database
async function initializeDatabase() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS parts (
        id SERIAL PRIMARY KEY,
        part_number TEXT UNIQUE,
        extended_length INTEGER,
        stroke INTEGER,
        force TEXT
      )
    `);
    console.log('Parts table created or already exists.');

    // Insert sample data
    const sampleParts = [
      { part_number: '30101', extended_length: 650, stroke: 224, force: '350N' },
      { part_number: '30102', extended_length: 700, stroke: 250, force: '400N' },
      { part_number: '30103', extended_length: 600, stroke: 200, force: '300N' },
      { part_number: '30104', extended_length: 750, stroke: 300, force: '450N' },
      { part_number: '30105', extended_length: 800, stroke: 350, force: '500N' }
    ];

    for (const part of sampleParts) {
      await client.query(
        'INSERT INTO parts (part_number, extended_length, stroke, force) VALUES ($1, $2, $3, $4) ON CONFLICT (part_number) DO NOTHING',
        [part.part_number, part.extended_length, part.stroke, part.force]
      );
    }
    console.log('Sample data inserted or already exists.');
  } catch (err) {
    console.error('Error initializing database:', err);
  } finally {
    client.release();
  }
}

initializeDatabase();

// API endpoint to get all parts
app.get('/api/parts', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM parts');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API endpoint to add a new part
app.post('/api/parts', async (req, res) => {
  const { part_number, extended_length, stroke, force } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO parts (part_number, extended_length, stroke, force) VALUES ($1, $2, $3, $4) RETURNING id',
      [part_number, extended_length, stroke, force]
    );
    res.json({ id: rows[0].id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// API endpoint to update a part
app.put('/api/parts/:id', async (req, res) => {
  const { part_number, extended_length, stroke, force } = req.body;
  try {
    const { rowCount } = await pool.query(
      'UPDATE parts SET part_number = $1, extended_length = $2, stroke = $3, force = $4 WHERE id = $5',
      [part_number, extended_length, stroke, force, req.params.id]
    );
    res.json({ updated: rowCount });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// API endpoint to delete a part
app.delete('/api/parts/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM parts WHERE id = $1', [req.params.id]);
    res.json({ deleted: rowCount });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});
