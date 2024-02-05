import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import loginRouter from "./routers/user.router.js";
import chatRouter from "./routers/chat.router.js";
import messageRouter from "./routers/message.router.js";
const server = express();
dotenv.config();

server.use(cors());
server.use(bodyParser.json());

server.use("/api", loginRouter);
server.use("/api", chatRouter);
server.use("/api", messageRouter);

server.use((error, req, res, next) => {
  const statuscode = error.statuscode || 500;
  const message = error.message || "Internal server error";
  return res.status(statuscode).json({
    success: false,
    statuscode,
    message,
  });
});

mongoose
  .connect(process.env.MONGO_DB)
  .then(() => {
    console.log("DB Connected");
  })
  .catch((err) => {
    console.log(err);
  });

const app = server.listen(8000, () => {
  console.log("server connected");
});

import { Server } from "socket.io";
const io = new Server(app, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:5173",
  },
});

// io.on("connection", (socket) => {
//   console.log("connected to socket.io");

//   socket.on("setup", (userData) => {
//     socket.join(userData._id);
//     socket.emit("connected");
//   });

//   socket.on("join chat", (room) => {
//     socket.join(room);
//   });

//   socket.on("new message", (newMessageReceived) => {
//     let chat = newMessageReceived.chat;
//     if (!chat.users) return console.log("users not defined");

//     chat.users.forEach((user) => {
//       if (user._id == newMessageReceived.sender._id) return;

//       socket.in(user._id).emit("message recieved", newMessageReceived);
//     });
//   });
// });

io.on("connection", (socket) => {
  socket.on("setup user", (userId) => {
    socket.join(userId);
  });
  socket.on("join chat", (chatId) => {
    socket.join(chatId);
    socket.emit("connected");
  });
  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("send message", (newMessageReceived) => {
    let chat = newMessageReceived.chat;
    if (!chat.users) return console.log("users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageReceived.sender._id) return;

      socket.in(user._id).emit("receive msg", newMessageReceived);
    });
  });
});
