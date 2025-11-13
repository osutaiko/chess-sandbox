import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

// Function to generate a random 8-character alphanumeric ID (Lichess style)
const generateRoomId = (): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

import { Game, Move, Variant, playMove } from 'common';


interface GameRoom {
  id: string;
  players: { [socketId: string]: number }; // socketId -> player index
  variant: Variant;
  game?: Game;
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));


// In-memory storage for game rooms
const gameRooms: { [key: string]: GameRoom } = {};

// API Routes
app.post('/api/rooms', (req, res) => {
  const variant = req.body.variant as Variant;
  if (!variant) {
    return res.status(400).json({ message: "Variant data is required" });
  }
  const roomId = generateRoomId();
  gameRooms[roomId] = {
    id: roomId,
    players: {},
    variant: variant,
  };
  console.log(`Room ${roomId} created with variant "${variant.name}". Player count: ${variant.playerCount}`);
  res.status(201).json({ roomId });
});

app.get('/api/rooms/:roomId', (req, res) => {
  const { roomId } = req.params;
  const room = gameRooms[roomId];
  if (room) {
    res.json({ variant: room.variant, playerCount: Object.keys(room.players).length });
  } else {
    res.status(404).json({ message: "Room not found" });
  }
});


// Socket.IO
io.on('connection', (socket) => {
  console.log('a user connected:', socket.id);

  socket.on('joinRoom', (roomId: string) => {
    const room = gameRooms[roomId];
    if (!room) {
      socket.emit('error', 'Room not found');
      return;
    }

    const numPlayersBeforeJoin = Object.keys(room.players).length;
    console.log(`[${roomId}] Players before join: ${numPlayersBeforeJoin}. Expected players: ${room.variant.playerCount}`);

    if (numPlayersBeforeJoin >= room.variant.playerCount) {
      socket.emit('error', 'Room is full');
      return;
    }

    socket.join(roomId);
    const playerIndex = numPlayersBeforeJoin;
    room.players[socket.id] = playerIndex;

    const numPlayersAfterJoin = Object.keys(room.players).length;
    console.log(`[${roomId}] User ${socket.id} joined as player ${playerIndex}. Total players: ${numPlayersAfterJoin}`);
    socket.emit('playerInfo', { playerIndex });
    io.to(roomId).emit('playerJoined', { socketId: socket.id, playerIndex });

    if (numPlayersAfterJoin === room.variant.playerCount) {
      console.log(`[${roomId}] All players joined. Initializing game.`);
      // Initialize game state
      room.game = {
        ...room.variant,
        currentBoard: JSON.parse(JSON.stringify(room.variant.initialBoard)), // Deep copy
        history: [],
        turn: 0,
      } as Game;
      io.to(roomId).emit('gameStart', { game: room.game, players: room.players });
      console.log(`[${roomId}] Game starting in room ${roomId}`);
    } else {
      console.log(`[${roomId}] Waiting for more players. Current: ${numPlayersAfterJoin}/${room.variant.playerCount}`);
    }
  });

  socket.on('chessMove', ({ roomId, move }: { roomId: string, move: Move }) => {
    const room = gameRooms[roomId];
    if (room && room.game) {
      const newGame = playMove(room.game, move);
      room.game = newGame;
      socket.to(roomId).emit('opponentMove', move);
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected:', socket.id);
    for (const roomId in gameRooms) {
      const room = gameRooms[roomId];
      if (room.players[socket.id] !== undefined) {
        const playerIndex = room.players[socket.id];
        delete room.players[socket.id];
        io.to(roomId).emit('playerLeft', { socketId: socket.id, playerIndex });
        console.log(`User ${socket.id} left room ${roomId}`);
        
        // If everyone left, delete it
        if (Object.keys(room.players).length === 0) {
          delete gameRooms[roomId];
          console.log(`Room ${roomId} is empty and has been deleted.`);
        }
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
