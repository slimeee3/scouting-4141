const API_KEY = 'oZ5EqIhTaevR7upIovHNPtnBgOBNpCg7wemoew06R147bFQfYg4CJ6bq352lpvkW';
const teamKey = 'frc4141';
const eventKey = '2025cabl';
const url = `https://www.thebluealliance.com/api/v3/team/${teamKey}/event/${eventKey}/matches`;

const matchSelector = document.getElementById('match-selector');
const predictionPanel = document.getElementById('prediction-panel');

let allMatches = [];

// Fetch matches from TBA
fetch(url, { headers: { 'X-TBA-Auth-Key': API_KEY } })
  .then(res => res.json())
  .then(data => {
    allMatches = data;

    // Sort by comp_level then match_number
    const compOrder = { qm: 0, qf: 1, sf: 2, f: 3 };
    allMatches.sort((a, b) => {
      const aComp = compOrder[a.comp_level] ?? 99;
      const bComp = compOrder[b.comp_level] ?? 99;
      if (aComp !== bComp) return aComp - bComp;
      return a.match_number - b.match_number;
    });

    // Strip "frc" prefix
    allMatches.forEach(match => {
      ['blue', 'red'].forEach(color => {
        match.alliances[color].team_keys = match.alliances[color].team_keys.map(t => t.replace('frc',''));
      });
    });

    // Create match buttons
    allMatches.forEach(match => {
      const btn = document.createElement('button');
      btn.textContent = `${match.comp_level.toUpperCase()} ${match.match_number}`;
      btn.className = 'match-btn';
      btn.addEventListener('click', () => showPrediction(match));
      matchSelector.appendChild(btn);
    });
  })
  .catch(err => console.error('Error fetching matches:', err));

// Predict scores for a match
function showPrediction(match) {
  // Only use previous qualification matches
  const prevMatches = allMatches.filter(m => m.match_number < match.match_number && m.comp_level === 'qm');

  if (prevMatches.length === 0) {
    predictionPanel.innerHTML = '<p>No prediction available for the first match.</p>';
    return;
  }

  // Build team stats
  const teamStats = {};
  prevMatches.forEach(m => {
    ['blue', 'red'].forEach(color => {
      const score = m.alliances[color].score ?? 0;
      const teams = m.alliances[color].team_keys;
      teams.forEach(t => {
        if (!teamStats[t]) teamStats[t] = { total: 0, matches: 0 };
        teamStats[t].total += score / teams.length; // divide points among team members
        teamStats[t].matches++;
      });
    });
  });

  // Assign default OPR if team has no previous match
  const allTeamKeys = [...match.alliances.blue.team_keys, ...match.alliances.red.team_keys];
  allTeamKeys.forEach(t => {
    if (!teamStats[t]) teamStats[t] = { total: 100, matches: 1 }; // default ~100 points
  });

  // Compute OPR per team
  Object.keys(teamStats).forEach(t => {
    teamStats[t].opr = teamStats[t].total / teamStats[t].matches;
  });

  // Predict alliance scores
  const bluePred = match.alliances.blue.team_keys.reduce((sum, t) => sum + (teamStats[t]?.opr ?? 100), 0);
  const redPred = match.alliances.red.team_keys.reduce((sum, t) => sum + (teamStats[t]?.opr ?? 100), 0);

  predictionPanel.innerHTML = `
    <h3>Prediction for ${match.comp_level.toUpperCase()} ${match.match_number}</h3>
    <p><strong>Blue Alliance:</strong> ${match.alliances.blue.team_keys.join(', ')} — Predicted Score: ${Math.round(bluePred)}</p>
    <p><strong>Red Alliance:</strong> ${match.alliances.red.team_keys.join(', ')} — Predicted Score: ${Math.round(redPred)}</p>
    <p style="font-weight:bold;">${Math.round(bluePred) > Math.round(redPred) ? 'Blue is predicted to win' : Math.round(bluePred) < Math.round(redPred) ? 'Red is predicted to win' : 'Tie predicted'}</p>
  `;
}
