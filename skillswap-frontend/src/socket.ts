import { io } from "socket.io-client";

const socket = io("http://localhost:5000"); // adapte si backend est en ligne

export default socket;
