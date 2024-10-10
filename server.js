// File: server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Use a persistent file path for the SQLite database
const dbPath = process.env.SQLITE_DB_PATH || path.resolve(__dirname, 'parts.db');

// Connect to SQLite database
const db = new sqlite3.Database(':memory:', (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Connected to the in-memory SQLite database.');
    initializeDatabase();
  }
});

function initializeDatabase() {
  db.run(`CREATE TABLE IF NOT EXISTS parts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    part_number TEXT UNIQUE,
    extended_length INTEGER,
    stroke INTEGER,
    force TEXT
  )`, (err) => {
    if (err) {
      console.error('Error creating table:', err.message);
    } else {
      console.log('Parts table created or already exists.');
      insertSampleData();
    }
  });
}

function insertSampleData() {
  const sampleParts = [
    { part_number: '30101', extended_length: 650, stroke: 224, force: '350N' },
    { part_number: '30102', extended_length: 700, stroke: 250, force: '400N' },
    { part_number: '30103', extended_length: 600, stroke: 200, force: '300N' },
    { part_number: '30104', extended_length: 750, stroke: 300, force: '450N' },
    { part_number: '30105', extended_length: 800, stroke: 350, force: '500N' }
  ];

  const insertStmt = db.prepare('INSERT OR IGNORE INTO parts (part_number, extended_length, stroke, force) VALUES (?, ?, ?, ?)');
  sampleParts.forEach((part) => {
    insertStmt.run(part.part_number, part.extended_length, part.stroke, part.force);
  });
  insertStmt.finalize(() => {
    console.log('Sample data inserted or already exists.');
  });
}

// API endpoint to get all parts
app.get('/api/parts', (req, res) => {
  db.all('SELECT * FROM parts', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// API endpoint to add a new part
app.post('/api/parts', (req, res) => {
  const { part_number, extended_length, stroke, force } = req.body;
  db.run('INSERT INTO parts (part_number, extended_length, stroke, force) VALUES (?, ?, ?, ?)',
    [part_number, extended_length, stroke, force],
    function(err) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID });
    });
});

// API endpoint to update a part
app.put('/api/parts/:id', (req, res) => {
  const { part_number, extended_length, stroke, force } = req.body;
  db.run('UPDATE parts SET part_number = ?, extended_length = ?, stroke = ?, force = ? WHERE id = ?',
    [part_number, extended_length, stroke, force, req.params.id],
    function(err) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.json({ changes: this.changes });
    });
});

// API endpoint to delete a part
app.delete('/api/parts/:id', (req, res) => {
  db.run('DELETE FROM parts WHERE id = ?', req.params.id, function(err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ deleted: this.changes });
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});
