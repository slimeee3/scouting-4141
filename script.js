// tba.js
import fetch from 'node-fetch';

// Put your key here
const API_KEY = "oZ5EqIhTaevR7upIovHNPtnBgOBNpCg7wemoew06R147bFQfYg4CJ6bq352lpvkW"; // <-- replace with your real key
const API_URL = 'https://www.thebluealliance.com/api/v3';
const EVENT_KEY = '2025cabl'; // Beach Blitz 2025

const getTBAData = async (endpoint) => {
  const url = `${API_URL}${endpoint}`;
  console.log('Fetching from:', url);

  try {
    const response = await fetch(url, {
      headers: { 'X-TBA-Auth-Key': API_KEY }
    });

    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const data = await response.json();
    console.log('Data received:', data);
    return data;

  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

// Example usage
const runExamples = async () => {
  await getTBAData(`/team/frc4141`);             // Team info
  await getTBAData(`/team/frc4141/events/2025`); // Team's 2025 events
  await getTBAData(`/event/${EVENT_KEY}/matches`);  // Beach Blitz 2025 matches
};

runExamples();
