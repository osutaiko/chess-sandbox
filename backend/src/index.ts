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
  creatorPreferredSide?: number; // -1 for random, 0 for White, 1 for Black
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

const gameRooms: { [key: string]: GameRoom } = {};
const variants: { [variantId: string]: Variant } = {};

// API Routes
app.post('/api/variants', (req, res) => {
  const variant = req.body.variant as Variant;
  if (!variant) {
    return res.status(400).json({ message: "Variant data is required" });
  }
  const variantId = generateRoomId();
  const newVariant = { ...variant, id: variantId };
  variants[variantId] = newVariant;
  console.log(`Variant ${variantId} saved: "${newVariant.name}"`);
  res.status(201).json({ variantId });
});

app.get('/api/variants/:variantId', (req, res) => {
  const { variantId } = req.params;
  const variant = variants[variantId];
  if (variant) {
    res.json(variant);
  } else {
    res.status(404).json({ message: "Variant not found" });
  }
});

app.get('/api/variants', (req, res) => {
  res.json(Object.values(variants));
});

app.post('/api/rooms', (req, res) => {
  const { variant, preferredSide } = req.body as { variant: Variant; preferredSide?: number };
  if (!variant) {
    return res.status(400).json({ message: "Variant data is required" });
  }
  const roomId = generateRoomId();
  gameRooms[roomId] = {
    id: roomId,
    players: {},
    variant: variant,
    // Store preferredSide for the room creator
    creatorPreferredSide: preferredSide !== undefined ? preferredSide : -1, // -1 for random
  };
  console.log(`Room ${roomId} created with variant "${variant.name}". Player count: ${variant.playerCount}. Creator preferred side: ${gameRooms[roomId].creatorPreferredSide}`);
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

    let playerIndex: number;
    if (numPlayersBeforeJoin === 0) { // First player joining (creator)
      if (room.creatorPreferredSide === 0 || room.creatorPreferredSide === -1) { // White or Random
        playerIndex = 0;
      } else { // Black
        playerIndex = 1;
      }
    } else { // Second player joining
      const existingPlayerIndex = Object.values(room.players)[0];
      playerIndex = 1 - existingPlayerIndex; // Assign the other side
    }

    if (Object.values(room.players).includes(playerIndex)) {
      playerIndex = 1 - playerIndex;
      if (Object.values(room.players).includes(playerIndex)) {
        socket.emit('error', 'No available player slots with preferred side.');
        return;
      }
    }

    socket.join(roomId);
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
      io.to(roomId).emit('gameUpdated', newGame);
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
