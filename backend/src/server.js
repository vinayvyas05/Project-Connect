import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './config/database.js';
import http from "http";
import { initSocket } from "./sockets/index.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

connectDB();

// 1. Create the HTTP server using the Express app
const server = http.createServer(app);

// 2. Initialize socket.io and attach it to THIS specific server
initSocket(server);

// 3. CRITICAL: Use server.listen, NOT app.listen
// This starts both Express (REST) and Socket.io on the same port
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});