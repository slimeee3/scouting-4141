import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000; // Use Render's port if available

// Serve static files from "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// TBA API key and team/event info
const API_KEY = 'oZ5EqIhTaevR7upIovHNPtnBgOBNpCg7wemoew06R147bFQfYg4CJ6bq352lpvkW';
const teamKey = 'frc4141';
const eventKey = '2025cabl';

// Route to fetch match data and return JSON
app.get('/matches', async (req, res) => {
  try {
    const url = `https://www.thebluealliance.com/api/v3/team/${teamKey}/event/${eventKey}/matches`;
    const response = await fetch(url, { headers: { 'X-TBA-Auth-Key': API_KEY } });
    let data = await response.json();

    // Sort matches: qualification -> playoffs
    const compOrder = { 'qm': 0, 'qf': 1, 'sf': 2, 'f': 3 };
    data.sort((a, b) => {
      const aComp = compOrder[a.comp_level] ?? 99;
      const bComp = compOrder[b.comp_level] ?? 99;
      if (aComp !== bComp) return aComp - bComp;
      return a.match_number - b.match_number;
    });

    res.json(data);

  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Error fetching matches' });
  }
});

// Route to serve main HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
