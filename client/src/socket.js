import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

export const socket = io(backendUrl, {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5
});