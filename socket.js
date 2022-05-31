const express = require("express");
const fs = require("fs");
const http = require("http");
const https = require("https");
// const sequelize = require("sequelize");
const morgan = require("morgan");
const hpp = require("hpp");
const helmet = require("helmet");
const cors = require("cors");

const SocketIO = require("socket.io");
const app = express();
const app_low = express();

const { Server } = require("socket.io");


const httpPort = 3000;
const httpsPort = 4433;

const requestMiddleware = (req, res, next) => {
    console.log(
      "[Ip address]:",
      req.ip,
      "[method]:",
      req.method,
      "Request URL:",
      req.originalUrl,
      " - ",
      new Date().toISOString()
    );
    next();
  };

app.use(cors());
// sequelize
//   .sync({ force: false })
//   .then(() => {
//     console.log("데이터베이스 연결 성공");
//   })
//   .catch((err) => {
//     console.error(err);
//   });

  //인증서 불러오기
const privateKey = fs.readFileSync(__dirname + "/pizzaboy_shop.key", "utf8");
const certificate = fs.readFileSync(
  __dirname + "/pizzaboy_shop__crt.pem",
  "utf8"
);
const ca = fs.readFileSync(__dirname + "/pizzaboy_shop__ca.pem", "utf8");
const credentials = {
  key: privateKey,
  cert: certificate,
  ca: ca,
};


app.use(express.json());
app.use(express.urlencoded());
app.use(requestMiddleware);
app.use(express.urlencoded({ extended: false }));
app.use(morgan("combined"));


// const server = http.createServer(app_low);
const server1 = https.createServer(credentials,app);
// server.listen(3001, () => {
//   console.log(3001, "번으로 서버가 켜졌어요!");
// });

const io = SocketIO(server1, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (data) => {
    socket.join(data);
    console.log(`User with ID: ${socket.id} joined room: ${data}`);
  });

  socket.on("send_message", (data) => {
    console.log("data-->",data);
    socket.to(data.room).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });

  socket.on("leave-room", (roomName, done) => {
    socket.leave(roomName);
    done();
    console.log("나 나갔어");
    // const rooms = getUserRooms();
    // if (!rooms.includes(roomName)) {
    io.emit("remove-room", roomName);
    console.log("방 삭제되었음");
  });
});

app.use(function (err, req, res, next) {
    console.error(err);
    res.status(500).send("Something Broke!");
  });
  
server.listen(httpPort, () => {
    console.log("http 서버가 켜졌어요");
  });
  
// server1.listen(httpsPort, () => {
//     console.log("https 서버가 켜졌어요");
//   });