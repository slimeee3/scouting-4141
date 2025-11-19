const teamKey = '4141'; // without "frc"
const url = '/matches';

fetch(url)
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById('matches-container');

    data.forEach(match => {
      const isBlue = match.alliances.blue.team_keys.includes(teamKey);

      const myAlliance = isBlue ? match.alliances.blue.team_keys : match.alliances.red.team_keys;
      const enemyAlliance = isBlue ? match.alliances.red.team_keys : match.alliances.blue.team_keys;

      const myScore = isBlue ? match.alliances.blue.score : match.alliances.red.score;
      const enemyScore = isBlue ? match.alliances.red.score : match.alliances.blue.score;

      const section = document.createElement('section');

      section.innerHTML = `
        <h3>${match.comp_level.toUpperCase()} Match ${match.match_number}</h3>
        <p><strong>My Alliance:</strong> ${myAlliance.join(', ')} - Points: ${myScore ?? 'N/A'}</p>
        <p><strong>Enemy Alliance:</strong> ${enemyAlliance.join(', ')} - Points: ${enemyScore ?? 'N/A'}</p>
      `;

      container.appendChild(section);
    });
  })
  .catch(err => console.error('Error fetching matches:', err));
