const { getConfiguration } = require("../../configs.js");
const env = getConfiguration();
const express = require("express");
const app = express();
const http = require("http");
const port = 8106;
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
let connected = false;
let timeout;
if (env.TIMED_MODE) {
  timeout = env.TIMED_MODE * 1.8 * 1000;
} else timeout = 5000;
io.on("connection", (socket) => {
  socket.on("disconnect", () => {
    if (connected)
      console.log(
        `\x1b[33m -\x1b[0m\x1b[2m\x1b[31m Obs overlay disconnected\x1b[0m`
      ),
        (connected = false);
  });
  if (!connected)
    console.log(
      `\x1b[33m -\x1b[0m\x1b[2m\x1b[36m Obs overlay connected\x1b[0m`
    ),
      (connected = true);
  obs.clear();
  io.emit("timeout", timeout);
});

server.listen(port, () => {
  console.log(`\x1b[33m -\x1b[0m\x1b[32m\x1b[2m Started obs overlay\x1b[0m`);
});

const obs = {
  send: function (msg) {
    io.emit("message", msg);
  },
  clear: function () {
    io.emit("clear");
  },
};

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

module.exports.obs = obs;
