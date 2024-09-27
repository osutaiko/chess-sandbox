const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());

app.get("/api/user/:username/basic", async (req, res) => {
  const fetch = (await import('node-fetch')).default;
  const username = req.params.username;
  try {
    const profileResponse = await fetch(`https://api.chess.com/pub/player/${username}`);
    const statsResponse = await fetch(`https://api.chess.com/pub/player/${username}/stats`);
    if (profileResponse.ok && statsResponse.ok) {
      const profileData = await profileResponse.json();
      const statsData = await statsResponse.json();
      res.json({ ...profileData, ...statsData });
    } else {
      res.status(500).json({ error: "User doesn't exist" })
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user data" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
