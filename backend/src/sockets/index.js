import { Server } from "socket.io";
import { socketAuth } from "./auth.socket.js";
import { channelSocket } from "./channel.socket.js";

let io;

export function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "*", // frontend later
      methods: ["GET", "POST"],
    },
  });

  // auth middleware
  io.use(socketAuth);

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.user.id);

    channelSocket(io, socket);

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.user.id);
    });
  });
}

export function getIO() {
  return io;
}
