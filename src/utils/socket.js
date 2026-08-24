import { io } from "socket.io-client";

const token = typeof window !== "undefined" ? localStorage.getItem("token") : ""; 

export const socket = io("https://stage.digibima.com/node-api/", {
  transports: ["polling", "websocket"], 
});