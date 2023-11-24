import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cloudinary from "cloudinary";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import fileUpload from "express-fileupload";

//routes
import UserRoute from "./routes/UserRoute.js";
import ChatRoute from "./routes/ChatRoute.js";
import MessageRoute from "./routes/MessageRoute.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended:true}));
app.use(fileUpload());


// config
dotenv.config({path:"config/config.env"});


//Creating server
const server = app.listen(process.env.PORT, () => {
    console.log(`Server is working on http://localhost:${process.env.PORT}`);
});

//Socket.io
const io = new Server(server, {
  pingTimeout:60000,
  cors: {
    origin: "http://localhost:3000"
  }
})

io.on("connection", (socket) => {
  console.log("Connected to socket.io");

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("Connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));

  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessage) => {
    var chat = newMessage.chat;
    if(!chat.users){
      return console.log("users not found");
    }
    chat.users.forEach((user) => {
      if(user._id == newMessage.sender._id) return;
      socket.in(user._id).emit("message received", newMessage);
    });
  });

  socket.off("setup", () => {
    console.log("User Disconnected");
    socket.leave(userData._id);
  });

});

//Connecting to MongoDB
const connectDatabase = () => {
  mongoose.connect(process.env.DB_URI,{useNewUrlParser:true,useUnifiedTopology:true
  }).then((data)=>{
      console.log(`Mongodb connected with server: ${data.connection.host}`);
  });
}
connectDatabase();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key:process.env.CLOUDINARY_API_KEY,
  api_secret:process.env.CLOUDINARY_API_SECRET
});

app.use('/api/v1/users', UserRoute);
app.use('/api/v1/chats', ChatRoute);
app.use('/api/v1/messages', MessageRoute);


// // Backend Code (Socket)
// let activeUsers = [];
// const onlineUsers = {}; // { userId: { socketId, unreadMessages: [] } }

// io.on("connection", (socket) => {
//   // add new User
//   socket.on("new-user-add", (newUserId) => {
//     // if user is not added previously
//     if (!activeUsers.some((user) => user.userId === newUserId)) {
//       activeUsers.push({ userId: newUserId, socketId: socket.id });
//       console.log("New User Connected", activeUsers);
//     }
//     // send all active users to new user
//     io.emit("get-users", activeUsers);
//   });

//   socket.on("disconnect", () => {
//     // remove user from active users
//     activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
//     console.log("User Disconnected", activeUsers);
//     // send all active users to all users
//     io.emit("get-users", activeUsers);
//   });

//   // send message to a specific user
//   socket.on("send-message", (data) => {
//     const { receiverId, messageId } = data;
//     const user = activeUsers.find((user) => user.userId === receiverId);
//     console.log("Sending from socket to :", receiverId);
//     console.log("Data: ", data);

//     if (user) {
//       // Mark the message as seen if the recipient is currently viewing the chat
//       const messageStatus = {
//         messageId,
//         sender: user.userId,
//         seen: false,
//       };

//       if (onlineUsers[user.userId] && onlineUsers[user.userId].socketId === user.socketId) {
//         // Recipient is online and viewing the chat, mark the message as seen
//         messageStatus.seen = true;
//       }

//       io.to(user.socketId).emit("recieve-message", { ...data, ...messageStatus });
//     }
//   });
// });

//mongodb+srv://Qurat-Ul-Ain:E1i2d3M4u5b6a7h8l9a10@chat.fkxiajp.mongodb.net/?retryWrites=true&w=majority
//http://localhost:3000