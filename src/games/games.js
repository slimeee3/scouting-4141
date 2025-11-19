const API_KEY = 'oZ5EqIhTaevR7upIovHNPtnBgOBNpCg7wemoew06R147bFQfYg4CJ6bq352lpvkW';
const teamKey = 'frc4141';
const eventKey = '2025cabl';
const url = `https://www.thebluealliance.com/api/v3/team/${teamKey}/event/${eventKey}/matches`;

fetch(url, { headers: { 'X-TBA-Auth-Key': API_KEY } })
  .then(res => res.json())
  .then(data => {

    // Sort matches: qm → qf → sf → f
    const compOrder = { 'qm': 0, 'qf': 1, 'sf': 2, 'f': 3 };
    data.sort((a, b) => {
      const aComp = compOrder[a.comp_level] ?? 99;
      const bComp = compOrder[b.comp_level] ?? 99;
      if (aComp !== bComp) return aComp - bComp;
      return a.match_number - b.match_number;
    });

    const container = document.getElementById('matches-container');

    data.forEach(match => {
      const blueAlliance = match.alliances.blue.team_keys;
      const redAlliance  = match.alliances.red.team_keys;

      const isBlue = blueAlliance.includes(teamKey);

      const myAlliance = (isBlue ? blueAlliance : redAlliance).map(t => t.replace('frc', ''));
      const enemyAlliance = (isBlue ? redAlliance : blueAlliance).map(t => t.replace('frc', ''));

      const myScore = isBlue ? match.alliances.blue.score : match.alliances.red.score;
      const enemyScore = isBlue ? match.alliances.red.score : match.alliances.blue.score;

      const section = document.createElement('section');

      section.innerHTML = `
        <h3>Match ${match.match_number} (${match.comp_level.toUpperCase()})</h3>

        <p>
          <strong>Our Alliance:</strong>
          <span class="my-alliance">${myAlliance.join(', ')}</span>
          — Points: <strong>${myScore ?? 'N/A'}</strong>
        </p>

        <p>
          <strong>Opponent Alliance:</strong>
          <span class="enemy-alliance">${enemyAlliance.join(', ')}</span>
          — Points: ${enemyScore ?? 'N/A'}
        </p>
      `;

      container.appendChild(section);
    });
  })
  .catch(err => console.error('Error fetching matches:', err));
