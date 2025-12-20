import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './config/database.js';
import http from "http";
import { initSocket } from "./sockets/index.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

connectDB();

// create http server
const server = http.createServer(app);

// initialize socket.io
initSocket(server);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
