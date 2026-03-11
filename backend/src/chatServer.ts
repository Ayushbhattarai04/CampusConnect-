const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

// Maps userId to socketId 
const userSocketMap = new Map<number, string>();

io.on("connection", (socket: import("socket.io").Socket) => {
  console.log("Socket connected:", socket.id);

  // Client emits this right after connecting so the server knows which user this socket is
  socket.on("register", ({ userId }: { userId: number }) => {
    userSocketMap.set(userId, socket.id);
    console.log(`User ${userId} registered with socket ${socket.id}`);
  });

  socket.on(
    "sendMessage",
    (msg: {
      id: string;
      text: string;
      fromUserId: number;
      toUserId: number;
      time: string;
    }) => {
      const recipientSocketId = userSocketMap.get(msg.toUserId);

      if (recipientSocketId) {
        // Send only to the intended recipient
        io.to(recipientSocketId).emit("receiveMessage", msg);
      } else {
        console.log(
          `User ${msg.toUserId} is not connected — message not delivered`,
        );
        // Optionally: store in DB for offline delivery here
      }
    },
  );

  socket.on("disconnect", () => {
    // Remove the user from the map when they disconnect
    for (const [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        userSocketMap.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
});

server.listen(3001, () => console.log("Socket server running on port 3001"));
