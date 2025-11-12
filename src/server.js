import express from 'express';
import fetch from 'node-fetch';

const app = express();
const PORT = 3000;

// TBA API key and team/event info
const API_KEY = 'oZ5EqIhTaevR7upIovHNPtnBgOBNpCg7wemoew06R147bFQfYg4CJ6bq352lpvkW';
const teamKey = 'frc4141';
const eventKey = '2025cabl';

app.get('/', async (req, res) => {
  try {
    const url = `https://www.thebluealliance.com/api/v3/team/${teamKey}/event/${eventKey}/matches`;
    const response = await fetch(url, {
      headers: { 'X-TBA-Auth-Key': API_KEY }
    });

    let data = await response.json();

    // Sort matches: first by comp_level (qualification -> playoff), then match_number
    const compOrder = { 'qm': 0, 'qf': 1, 'sf': 2, 'f': 3 };
    data.sort((a, b) => {
      const aComp = compOrder[a.comp_level] ?? 99;
      const bComp = compOrder[b.comp_level] ?? 99;
      if (aComp !== bComp) return aComp - bComp;
      return a.match_number - b.match_number;
    });

    // Build HTML
    let html = `
      <html>
      <head>
        <title>Team 4141 Matches</title>
      </head>
      <body>
        <h1>Matches for Team 4141 at ${eventKey}</h1>
        <ul>
    `;

    data.forEach(match => {
      const alliance = match.alliances.blue.team_keys.includes(teamKey) ? 'Blue' : 'Red';
      html += `<li>Match ${match.match_number} (${match.comp_level.toUpperCase()}) - ${alliance} alliance</li>`;
    });

    html += `
        </ul>
      </body>
      </html>
    `;

    res.send(html);

  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching matches');
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
