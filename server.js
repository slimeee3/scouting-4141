import express from 'express';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

// Serve everything in src as static files
app.use(express.static(path.join(process.cwd(), 'src')));

// Route for games page
app.get('/games', (req, res) => {
  const filePath = path.join(process.cwd(), 'src', 'games', 'games.html');
  console.log('Serving games page from:', filePath);
  res.sendFile(filePath, err => {
    if (err) {
      console.error('Error sending games.html:', err);
      res.status(404).send('games.html not found');
    }
  });
});

// Route for prediction page
app.get('/prediction', (req, res) => {
  const filePath = path.join(process.cwd(), 'src', 'prediction', 'prediction.html');
  console.log('Serving prediction page from:', filePath);
  res.sendFile(filePath, err => {
    if (err) {
      console.error('Error sending prediction.html:', err);
      res.status(404).send('prediction.html not found');
    }
  });
});

// Redirect root to /games
app.get('/', (req, res) => {
  res.redirect('/games');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Current working directory:', process.cwd());
});
