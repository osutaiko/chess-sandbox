const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());

app.get('/api/user/:username', async (req, res) => {
  const fetch = (await import('node-fetch')).default;
  const username = req.params.username;
  try {
    const response = await fetch(`https://www.chess.com/callback/user/popup/${username}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
