import express from 'express';
import fetch from 'node-fetch';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from src
app.use(express.static('src'));

// Routes for HTML pages
app.get('/game', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'src', 'games', 'games.html'));
});

app.get('/prediction', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'src', 'prediction', 'prediction.html'));
});

// Redirect root
app.get('/', (req, res) => res.redirect('/game'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
