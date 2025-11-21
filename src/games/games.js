const API_KEY = 'oZ5EqIhTaevR7upIovHNPtnBgOBNpCg7wemoew06R147bFQfYg4CJ6bq352lpvkW';
const teamKey = 'frc4141';
const eventKey = '2025cabl';
const url = `https://www.thebluealliance.com/api/v3/team/${teamKey}/event/${eventKey}/matches`;

const modal = document.getElementById('match-modal');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const modalClose = document.querySelector('.modal-close');

modalClose.addEventListener('click', () => {
  modal.style.display = 'none';
});

window.addEventListener('click', e => {
  if (e.target === modal) modal.style.display = 'none';
});

// Fetch matches
fetch(url, { headers: { 'X-TBA-Auth-Key': API_KEY } })
  .then(res => res.json())
  .then(data => {
    // Remove frc prefix
    data.forEach(match => {
      ['blue', 'red'].forEach(color => {
        match.alliances[color].team_keys = match.alliances[color].team_keys.map(t => t.replace('frc', ''));
      });
    });

    // --- SORT MATCHES ---
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
      const myAlliance = (isBlue ? match.alliances.blue.team_keys : match.alliances.red.team_keys);
      const enemyAlliance = (isBlue ? match.alliances.red.team_keys : match.alliances.blue.team_keys);
      const myScore = isBlue ? match.alliances.blue.score : match.alliances.red.score;
      const enemyScore = isBlue ? match.alliances.red.score : match.alliances.blue.score;

      const section = document.createElement('section');
      section.innerHTML = `
        <h3>Match ${match.match_number} (${match.comp_level.toUpperCase()})</h3>
        <p><strong>Our Alliance:</strong> <span class="my-alliance">${myAlliance.join(', ')}</span> — ${myScore ?? 0}</p>
        <p><strong>Opponent Alliance:</strong> <span class="enemy-alliance">${enemyAlliance.join(', ')}</span> — ${enemyScore ?? 0}</p>
      `;

      section.addEventListener('click', () => showMatchModal(match));
      container.appendChild(section);
    });
  })
  .catch(err => console.error('Error fetching matches:', err));

// Show modal function
function showMatchModal(match) {
  const isBlue = match.alliances.blue.team_keys.includes(teamKey);
  const mySideKey = isBlue ? 'blue' : 'red';
  const oppSideKey = isBlue ? 'red' : 'blue';

  modalTitle.textContent = `Match ${match.match_number} (${match.comp_level.toUpperCase()})`;

  let html = '';

  html += generateAllianceBlock(match.score_breakdown?.blue, match.alliances.blue.team_keys, mySideKey === 'blue', 'Blue Alliance');
  html += generateAllianceBlock(match.score_breakdown?.red, match.alliances.red.team_keys, mySideKey === 'red', 'Red Alliance');

  // Result
  const myScore = isBlue ? match.alliances.blue.score : match.alliances.red.score;
  const otherScore = isBlue ? match.alliances.red.score : match.alliances.blue.score;
  if (myScore != null && otherScore != null) {
    const result = myScore > otherScore ? 'Win' : myScore < otherScore ? 'Loss' : 'Tie';
    html += `<p style="font-weight:bold; font-size:1.1em; color:#a80000; text-align:center;">Result: ${result}</p>`;
  }

  modalBody.innerHTML = html;
  modal.style.display = 'flex';
}

// Helper function to generate full alliance block
function generateAllianceBlock(side, teamKeys, isOurAlliance, title) {
  if (!side) return `<p>${title}: No data available</p>`;

  const displayTeams = teamKeys.map(t => t.replace('frc', ''));

  // Auto
  const autoPoints = side.autoPoints ?? 0;
  const autoMobility = side.autoMobilityPoints ?? 0;
  const autoCoral = side.autoCoralPoints ?? 0;
  const autoAlgae = side.algaePoints ?? 0;

  // Teleop
  const teleopPoints = side.teleopPoints ?? 0;
  const teleopCoral = side.teleopCoralPoints ?? 0;
  const teleopAlgae = side.netAlgaeCount ?? 0;

  // Climb
  const climbPoints = side.endGameBargePoints ?? 0;
  const robotClimbs = [
    side.endGameRobot1,
    side.endGameRobot2,
    side.endGameRobot3
  ];

  const allianceHtml = displayTeams.map((t, i) => `${t}-${robotClimbs[i]}`).join(', ');

  return `
    <div style="
      padding:10px; 
      margin:10px 0; 
      border-radius:8px; 
      background-color:${isOurAlliance ? '#ffcccc' : '#e6e6e6'}; 
      color:${isOurAlliance ? '#a80000' : '#555'};
    ">
      <h4>${title}</h4>
      <p><strong>Auto Points:</strong> ${autoPoints} (Mobility: ${autoMobility}, Coral: ${autoCoral}, Algae: ${autoAlgae})</p>
      <p>Auto Line: ${displayTeams[0]}-${side.autoLineRobot1}, ${displayTeams[1]}-${side.autoLineRobot2}, ${displayTeams[2]}-${side.autoLineRobot3}</p>
      <p><strong>Teleop Points:</strong> ${teleopPoints} (Coral: ${teleopCoral}, Algae: ${teleopAlgae})</p>
      <p><strong>Climb:</strong> ${climbPoints} (Robots: ${allianceHtml})</p>
    </div>
  `;
}
