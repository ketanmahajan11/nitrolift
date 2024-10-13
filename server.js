// File: server.js
const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: 'https://nitroliftsupports.onrender.com'  // Replace with your GitHub Pages URL
}));
app.use(express.json());

// Database connection
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

// Define the Part model
const Part = sequelize.define('Part', {
  part_number: {
    type: DataTypes.STRING,
    unique: true
  },
  extended_length: DataTypes.INTEGER,
  stroke: DataTypes.INTEGER,
  force: DataTypes.STRING
});

// Sync the model with the database
sequelize.sync({ force: false }).then(() => {
  console.log('Database & tables created!');
  insertSampleData();
});

function insertSampleData() {
  const sampleParts = [
    { part_number: '30101', extended_length: 650, stroke: 224, force: '350N' },
    { part_number: '30102', extended_length: 700, stroke: 250, force: '400N' },
    { part_number: '30103', extended_length: 600, stroke: 200, force: '300N' },
    { part_number: '30104', extended_length: 750, stroke: 300, force: '450N' },
    { part_number: '30105', extended_length: 800, stroke: 350, force: '500N' }
  ];

  sampleParts.forEach(part => {
    Part.findOrCreate({
      where: { part_number: part.part_number },
      defaults: part
    });
  });
}

// API endpoint to get all parts
app.get('/api/parts', async (req, res) => {
  try {
    const parts = await Part.findAll();
    res.json(parts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to add a new part
app.post('/api/parts', async (req, res) => {
  try {
    const part = await Part.create(req.body);
    res.status(201).json(part);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// API endpoint to update a part
app.put('/api/parts/:id', async (req, res) => {
  try {
    const [updated] = await Part.update(req.body, {
      where: { id: req.params.id }
    });
    if (updated) {
      const updatedPart = await Part.findOne({ where: { id: req.params.id } });
      res.status(200).json(updatedPart);
    } else {
      res.status(404).json({ error: 'Part not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// API endpoint to delete a part
app.delete('/api/parts/:id', async (req, res) => {
  try {
    const deleted = await Part.destroy({
      where: { id: req.params.id }
    });
    if (deleted) {
      res.status(204).send("Part deleted");
    } else {
      res.status(404).json({ error: 'Part not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});
