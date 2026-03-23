import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

// Set up Socket.io with CORS allowing our future Vite frontend (usually port 5173)
const io = new Server(server, {
  cors: {
    origin: "*", // We will restrict this to your Vercel domain in production
    methods: ["GET", "POST"]
  }
});

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://127.0.0.1:8000';
const APP_PASSCODE = process.env.APP_PASSCODE || 'secret-admin-2026';

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (token === APP_PASSCODE) {
    next();
  } else {
    console.log(`❌ Rejected unauthorized connection attempt: ${socket.id}`);
    next(new Error("Unauthorized: Invalid passcode"));
  }
});

io.on('connection', (socket) => {
  console.log(`⚡ User connected: ${socket.id}`);

  // Listen for the 'ask_query' event from the React frontend
  socket.on('ask_query', async (data) => {
    const { prompt } = data;
    console.log(`Received prompt: "${prompt}"`);

    // 1. Immediately tell the frontend we started working
    socket.emit('agent_status', { message: 'Agent is analyzing your request...' });

    try {
      // Optional: Simulate progressive updates to make the UI feel alive while Python works
      setTimeout(() => socket.emit('agent_status', { message: 'Writing and executing SQL query...' }), 2000);
      setTimeout(() => socket.emit('agent_status', { message: 'Formatting raw data into Recharts JSON...' }), 5000);

      // 2. Call the Python AI Microservice
      const response = await axios.post(`${PYTHON_API_URL}/api/query`, { prompt });

      // 3. Send the final generated JSON back to the frontend
      socket.emit('final_chart_ready', response.data);
      console.log('✅ Chart configuration sent to frontend.');

    } catch (error) {
      console.error("❌ Error communicating with Python backend:", error.message);
      socket.emit('agent_error', { 
        message: 'The AI encountered an error processing your request.',
        details: error.message
      });
    }
  });

  socket.on('disconnect', () => {
    console.log(`🔴 User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Node.js running on port ${PORT}`);
});