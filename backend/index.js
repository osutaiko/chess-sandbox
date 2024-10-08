const express = require("express");
const cors = require("cors");
const { Chess } = require("chess.js");
const app = express();

app.use(cors());

app.get("/api/user/:username/basic", async (req, res) => {
  const fetch = (await import('node-fetch')).default;
  const { username } = req.params;
  try {
    const profileResponse = await fetch(`https://api.chess.com/pub/player/${username}`);
    const statsResponse = await fetch(`https://api.chess.com/pub/player/${username}/stats`);
    if (profileResponse.ok && statsResponse.ok) {
      const profileData = await profileResponse.json();
      const statsData = await statsResponse.json();
      res.json({ ...profileData, ...statsData });
    } else {
      res.status(404).json({ error: "User doesn't exist" })
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user data" });
  }
});

app.get("/api/game", async (req, res) => {
  const { url, pgn } = req.query;
  if (!(url || pgn)) {
    res.status(500).json({ error: "No game data provided" });
  }

  const getGameSource = (url, pgn) => {
    if (pgn) {
      return {
        from: "PGN",
      }
    }

    const chessComRegex = /^https:\/\/(www\.)?chess\.com\/game\/(live|daily|computer)\/(\d+)/;
    const lichessRegex = /^https:\/\/(www\.)?lichess\.org\/(\w{8}|\w{12})$/;

    const chessComMatch = url.match(chessComRegex);
    const lichessMatch = url.match(lichessRegex);

    if (chessComMatch) {
      return {
        from: "Chess.com",
        type: chessComMatch[2], // live, daily, or computer
        gameId: chessComMatch[3], // Game ID
      };
    }
    if (lichessMatch) {
      return {
        from: "Lichess",
        gameId: lichessMatch[2], // Lichess game ID
      };
    }
    
    return null;
  };

  const gameSource = getGameSource(url, pgn);

  if (!gameSource) {
    return res.status(400).json({ error: "Unsupported or invalid game URL" });
  }

  const applyMoves = (chess, e) => {
    var T = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!?{~}(^)[_]@#$,./&-*++=";
    var c, a, g = e.length, f = [];
    for (c = 0; c < g; c += 2) {
      var d = {}, b = T.indexOf(e[c]);
      63 < (a = T.indexOf(e[c + 1])) && (d.promotion = "qnrbkp"[Math.floor((a - 64) / 3)], a = b + (16 > b ? -8 : 8) + (a - 1) % 3 - 1);
      75 < b ? d.drop = "qnrbkp"[b - 79] : d.from = T[b % 8] + (Math.floor(b / 8) + 1);
      d.to = T[a % 8] + (Math.floor(a / 8) + 1);
  
      // Handle unorthodox Chess.com castling notation
      const castlingRights = {
        white: chess.getCastlingRights('w'),
        black: chess.getCastlingRights('b')
      };
      if (d.from === 'e1' && (d.to === 'h1' || d.to === 'a1')) {
        if (d.to === 'h1' && castlingRights.white.k) d.to = 'g1'; // Kingside white castling
        if (d.to === 'a1' && castlingRights.white.q) d.to = 'c1'; // Queenside white castling
      }
  
      if (d.from === 'e8' && (d.to === 'h8' || d.to === 'a8')) {
        if (d.to === 'h8' && castlingRights.black.k) d.to = 'g8'; // Kingside black castling
        if (d.to === 'a8' && castlingRights.black.q) d.to = 'c8'; // Queenside black castling
      }
  
      chess.move(d);
    }
  };

  try {
    if (gameSource.from === "Chess.com") {
      const fetch = (await import('node-fetch')).default;
      const response = await fetch(`https://www.chess.com/callback/${gameSource.type}/game/${gameSource.gameId}`);
      if (response.ok) {
        const data = await response.json();
        let chess = new Chess();

        applyMoves(chess, data.game.moveList);

        const isLiveGame = data.game.isLiveGame;
        
        const timestamps = isLiveGame ?
          data.game.moveTimestamps.split(",").map((ts) => parseFloat(ts) / 10) :
          data.game.timestamps.map((ts) => Math.floor(ts / 10));

        const timeControl = isLiveGame ? {
          base: Math.round(data.game.baseTime1 / 10),
          increment: Math.round(data.game.timeIncrement1 / 10),
        } : {
          daysPerTurn: data.game.daysPerTurn,
        };

        res.json({
          from: "Chess.com",
          event: data.game.pgnHeaders.Event || "New Chess.com Game",
          site: data.game.pgnHeaders.Site || "Chess.com",
          date: new Date(data.game.endTime * 1000).toLocaleDateString('en-CA', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          }).replace(/-/g, '.'),
          round: data.game.pgnHeaders.Round || "?",
          players: {
            white: {
              name: data.game.pgnHeaders.White,
              avatarUrl: data.players.bottom.avatarUrl,
              countryId: data.players.bottom.countryId,
              ratingAfter: parseInt(data.players.bottom.rating),
              ratingChange: parseInt(data.game.ratingChangeWhite),
            },
            black: {
              name: data.game.pgnHeaders.Black,
              avatarUrl: data.players.top.avatarUrl,
              countryId: data.players.top.countryId,
              ratingAfter: parseInt(data.players.top.rating),
              ratingChange: parseInt(data.game.ratingChangeBlack),
            },
          },
          result: data.game.pgnHeaders.Result,
          resultMessage: data.game.resultMessage,
          moves: chess.history(),
          isLiveGame,
          timestamps,
          timeControl,
        });
      } else {
        res.status(404).json({ error: "Game not found" });
      }
    } else if (gameSource.from === "Lichess") {
      // unimplemented
      res.status(404).json({ error: "Game not found" });
    } else if (gameSource.from === "PGN") {
      let chess = new Chess();
      chess.loadPgn(pgn);

      res.json({
        from: "PGN",
        event: chess.header().Event || "New PGN Game",
        site: chess.header().Site || "?",
        date: chess.header().Date || "????.??.??",
        round: chess.header().Round || "?",
        players: {
          white: {
            name: chess.header().White || "?",
            avatarUrl: null,
            countryId: null,
            ratingAfter: parseInt(chess.header().WhiteElo || 0),
            ratingChange: 0,
          },
          black: {
            name: chess.header().Black || "?",
            avatarUrl: null,
            countryId: null,
            ratingAfter: parseInt(chess.header().BlackElo || 0),
            ratingChange: 0,
          },
        },
        result: "*",
        resultMessage: chess.header().Termination || null,
        moves: chess.history(),
        isLiveGame: null,
        timestamps: null,
        timeControl: null,
      });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch game data" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
