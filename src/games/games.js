const API_KEY = 'YOUR_API_KEY';
const teamKey = 'frc4141';
const eventKey = '2025cabl';
const url = `https://www.thebluealliance.com/api/v3/team/${teamKey}/event/${eventKey}/matches`;

fetch(url, { headers: { 'X-TBA-Auth-Key': API_KEY } })
  .then(res => res.json())
  .then(data => {
    const compOrder = { qm: 0, qf: 1, sf: 2, f: 3 };
    data.sort((a, b) => {
      const aComp = compOrder[a.comp_level] ?? 99;
      const bComp = compOrder[b.comp_level] ?? 99;
      if (aComp !== bComp) return aComp - bComp;
      return a.match_number - b.match_number;
    });

    const container = document.getElementById('matches-container');

    data.forEach(match => {
      const isBlue = match.alliances.blue.team_keys.includes(teamKey);

      const myAlliance = (isBlue ? match.alliances.blue.team_keys : match.alliances.red.team_keys)
                          .map(t => t.replace('frc',''));
      const enemyAlliance = (isBlue ? match.alliances.red.team_keys : match.alliances.blue.team_keys)
                            .map(t => t.replace('frc',''));

      const myScore = isBlue ? match.alliances.blue.score : match.alliances.red.score;
      const enemyScore = isBlue ? match.alliances.red.score : match.alliances.blue.score;

      const section = document.createElement('section');
      section.innerHTML = `
        <h3>Match ${match.match_number} (${match.comp_level.toUpperCase()})</h3>
        <p><strong>My Alliance:</strong> ${myAlliance.join(', ')} - Points: ${myScore ?? 'N/A'}</p>
        <p><strong>Enemy Alliance:</strong> ${enemyAlliance.join(', ')} - Points: ${enemyScore ?? 'N/A'}</p>
      `;

      container.appendChild(section);
    });
  })
  .catch(err => console.error('Error fetching matches:', err));
