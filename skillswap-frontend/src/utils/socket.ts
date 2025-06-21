// src/utils/socket.ts
import { io } from "socket.io-client";

// Connexion au backend Socket.io
const socket = io("http://localhost:5000", {
  transports: ["websocket"],
  withCredentials: true
});

export default socket;
