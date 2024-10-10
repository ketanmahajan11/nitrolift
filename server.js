// File: server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Connect to SQLite database
const db = new sqlite3.Database('./parts.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the parts database.');
});

// Create parts table
db.run(`CREATE TABLE IF NOT EXISTS parts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  part_number TEXT,
  extended_length INTEGER,
  stroke INTEGER,
  force TEXT
)`);

// Sample data insertion
const sampleParts = [
  { part_number: '30101', extended_length: 650, stroke: 224, force: '350N' },
  { part_number: '30102', extended_length: 700, stroke: 250, force: '400N' },
  { part_number: '30103', extended_length: 600, stroke: 200, force: '300N' },
  { part_number: '30104', extended_length: 750, stroke: 300, force: '450N' },
  { part_number: '30105', extended_length: 800, stroke: 350, force: '500N' }
];

sampleParts.forEach((part) => {
  db.run('INSERT OR IGNORE INTO parts (part_number, extended_length, stroke, force) VALUES (?, ?, ?, ?)', 
    [part.part_number, part.extended_length, part.stroke, part.force]);
});

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

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
