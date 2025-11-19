import express from 'express';
import fetch from 'node-fetch';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

// TBA API info
const API_KEY = 'oZ5EqIhTaevR7upIovHNPtnBgOBNpCg7wemoew06R147bFQfYg4CJ6bq352lpvkW';
const teamKey = 'frc4141';
const eventKey = '2025cabl';

// Serve static files from src
app.use('/games', express.static(path.join(process.cwd(), 'src', 'games')));
app.use('/prediction', express.static(path.join(process.cwd(), 'src', 'prediction')));

// Match API
app.get('/matches', async (req, res) => {
  try {
    const url = `https://www.thebluealliance.com/api/v3/team/${teamKey}/event/${eventKey}/matches`;
    const response = await fetch(url, { headers: { 'X-TBA-Auth-Key': API_KEY } });
    let data = await response.json();

    // Sort: qualification -> playoffs
    const compOrder = { qm: 0, qf: 1, sf: 2, f: 3 };
    data.sort((a, b) => {
      const aComp = compOrder[a.comp_level] ?? 99;
      const bComp = compOrder[b.comp_level] ?? 99;
      if (aComp !== bComp) return aComp - bComp;
      return a.match_number - b.match_number;
    });

    // Remove frc prefix
    data.forEach(match => {
      ['blue', 'red'].forEach(color => {
        match.alliances[color].team_keys = match.alliances[color].team_keys.map(t => t.replace('frc', ''));
      });
    });

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Error fetching matches' });
  }
});

// Serve HTML pages
app.get('/games', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'src', 'games', 'games.html'));
});

app.get('/prediction', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'src', 'prediction', 'prediction.html'));
});

// Redirect root to /games
app.get('/', (req, res) => res.redirect('/games'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
