module.exports = (env) => {
  require("child_process").execSync("git fetch", { cwd: __dirname });
  let commit = require("child_process")
    .execSync("git status -uno", { cwd: __dirname })
    .toString()
    .trim();
  if (commit.includes("Your branch is behind"))
    console.log(
      "\x1b[40m\x1b[31mThere is a new version of TwitchPlaysWii available!\x1b[0m"
    ),
      console.log(
        "\x1b[40m\x1b[31mRun\x1b[33m git pull\x1b[31m to update.\x1b[0m"
      );

  ////////////////////////////////
  // OBS OVERLAY
  ////////////////////////////////
  const express = require("express");
  const app = express();
  const http = require("http");
  const port = 4303;
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
    console.log(timeout);
    io.emit("timeout", timeout);
    obs.send("3 there");
    obs.send("4 there");
  });
  let rand = Math.floor(Math.random() * (6000 - 3000 + 1)) + 3000;
  console.log(rand);
  setInterval(function () {
    obs.send(
      `<span style="color:red;font-weight: 700">test</span> ${new Date().getSeconds()}`,
      4000
    );
  }, 2000);

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

  const { Client } = require("tmi.js");
  const { keyboard, Key, getActiveWindow } = require("@nut-tree/nut-js");
  const { findBestMatch } = require("string-similarity");
  const fs = require("fs");
  require("dotenv").config();
  // const env = {
  //   CHANNEL: process.env.CHANNEL || "nil",
  //   MODE: process.env.MODE || "nil",
  //   TIMED_INTERVAL: Number(process.env.TIMED_INTERVAL) || 0,
  // };
  //TODO: Write env checks
  // if (
  //   Object.values(env).includes("nil") ||
  //   Object.values(env).includes(0) ||
  //   (env.MODE != "CHAOS" && env.MODE != "TIMED")
  // )
  //   console.error(
  //     "\x1b[40m\x1b[31mNot all\x1b[33m .ENV\x1b[31m variables are defined, or are incorrect!\x1b[0m\n" +
  //       "\x1b[40m\x1b[31mPlease check the\x1b[33m .env\x1b[31m file.\x1b[0m\n" +
  //       "\x1b[40m\x1b[31mFor guidance, see \x1b[33m.env.example\x1b[31m.\x1b[0m"
  //   ),
  //     process.exit();

  const client = new Client({
    channels: [env.CHANNEL],
  });

  console.clear();
  console.log(
    `\x1b[0m\x1b[2m\x1b[36mAttempting to connect to channel\x1b[35m ${env.CHANNEL} \x1b[2m\x1b[33m`
  );
  client.connect();

  let inputConfigs = [];
  for (let config of fs
    .readdirSync(`./inputs/`)
    .filter((file) => file.endsWith(".json"))) {
    inputConfigs.push(config);
  }
  if (!inputConfigs.length)
    console.error(
      "\x1b[0m\x1b[40m\x1b[31mYou do not have any\x1b[33m input\x1b[31m configuration files!\x1b[0m\n" +
        "\x1b[40m\x1b[31mPlease check the\x1b[33m inputs/README\x1b[31m file.\x1b[0m\n"
    ),
      process.exit();

  let lastInput;
  const inputs = new Map();
  const outputs = new Map();
  const times = new Map();
  const interval = setInterval(setInput, 2000);
  async function setInput() {
    const windowRef = await getActiveWindow();
    const [title] = await Promise.all([windowRef.title]);
    if (!title.includes("Dolphin")) return;
    if (lastInput === title) return;
    const match = findBestMatch(title, inputConfigs);
    if (match.bestMatch.rating < 0.2) return;
    const inputData = require(`./inputs/${match.bestMatch.target}`);
    inputs.clear();
    outputs.clear();
    times.clear();
    for (let i of inputData) {
      for (let input of i.inputs) {
        inputs.set(input, i.name);
      }
      outputs.set(i.name, i.outputs);
      times.set(i.name, i.time);
    }
    console.log(
      `\x1b[33m -\x1b[0m\x1b[36m Automatically ${
        lastInput ? "switched to" : "selected"
      } config\x1b[35m\x1b[1m ${match.bestMatch.target}\x1b[0m`
    );
    lastInput = title;
    clearInterval(interval);
  }
  setInterval(setInput, 15000);

  client.on("connected", async () => {
    setInput();
    console.log(
      `\x1b[0m\x1b[32mSuccessfully connected to\x1b[35m ${env.CHANNEL}`
    );
    console.log(
      `\x1b[0m\x1b[32mStarted in \x1b[33m${
        env.TIMED_MODE ? "TIMED" : "CHAOS"
      }\x1b[32m mode.\x1b[0m`
    );

    server.listen(port, () => {
      console.log(
        `\x1b[33m -\x1b[0m\x1b[32m\x1b[2m Started obs overlay\x1b[0m`
      );
    });
  });
  ////////////////////////////////
  // TIMED MODE
  ////////////////////////////////
  if (env.TIMED_MODE) {
    const tempMap = new Map();
    let tempUser = [];
    client.on("message", async (channel, tags, m, self) => {
      obs.send(
        `<span style="color: ${tags.color}">${tags.username}</span> ${m}`
      );
      console.log(tags.color);
      if (self || !lastInput) return;
      let user = tempUser.find((u) => u === tags.username);
      if (user) return;
      let { name } = getMatch(m);
      if (!name) return;
      let map = tempMap.get(name);
      console.log(
        `\x1b[2m\x1b[34m${tags.username} chose:\x1b[33m ${name}\x1b[0m`
      );
      tempUser.push(tags.username);
      if (!map) {
        tempMap.set(name, 1);
      } else {
        tempMap.set(name, map + 1);
      }
    });

    setInterval(async () => {
      if (!tempMap.size) return;
      const windowRef = await getActiveWindow();
      const [title] = await Promise.all([windowRef.title]);
      if (
        !title.includes("Dolphin") ||
        (!title.includes("Dolphin") && !title.includes("|"))
      )
        return console.log(
          "\x1b[2m\x1b[33mIncorrect window, input preserved\x1b[0m"
        );
      let highestValue = -Infinity;
      let highestKey = "";
      let keysWithHighestValue = [];
      for (const [key, value] of tempMap) {
        if (value > highestValue) {
          highestValue = value;
          highestKey = key;
          keysWithHighestValue = [key];
        } else if (value === highestValue) {
          keysWithHighestValue.push(key);
        }
      }

      if (keysWithHighestValue.length > 1) {
        const randomIndex = Math.floor(
          Math.random() * keysWithHighestValue.length
        );
        highestKey = keysWithHighestValue[randomIndex];
      }
      console.log(`\x1b[36mCollective input:\x1b[35m ${highestKey}\x1b[0m`);
      let time = times.get(highestKey);
      tempMap.clear();
      tempUser = [];

      const outEnumKey = Key[outputs.get(highestKey)];
      hold(outEnumKey, time);
    }, Number(env.INTERVAL) * 1000);
  }
  ////////////////////////////////
  // CHAOS MODE
  ////////////////////////////////
  if (!env.TIMED_MODE) {
    client.on("message", async (channel, tags, m, self) => {
      if (self || !lastInput) return;

      const windowRef = await getActiveWindow();
      const [title] = await Promise.all([windowRef.title]);
      if (
        !title.includes("Dolphin") ||
        (!title.includes("Dolphin") && !title.includes("|"))
      )
        return console.log(
          "\x1b[2m\x1b[33mIncorrect window, cancelled input.\x1b[0m"
        );

      let { output, time, name } = getMatch(m);
      if (!output) return;
      console.log(`\x1b[34m${tags.username}:\x1b[33m ${name}\x1b[0m`);
      hold(Key[output], time);
    });
  }

  ////////////////////////////////
  // FUNCTIONS
  ////////////////////////////////
  async function hold(keys, seconds) {
    const startTime = Date.now();
    await keyboard.pressKey(keys);
    seconds = seconds * 1000 - (Date.now() - startTime);
    setTimeout(async function () {
      await keyboard.releaseKey(keys);
    }, seconds);
  }
  function getMatch(m) {
    if (typeof m != "string" || m == null)
      return { output: undefined, time: undefined, name: undefined };
    m = m.trim().toLowerCase();

    let match = findBestMatch(m, Array.from(inputs.keys()));
    if (match) {
      if (match.bestMatch.rating < 0.5)
        return { output: undefined, time: undefined, name: undefined };
      match = match.bestMatch.target;
    } else return;

    const name = inputs.get(match);
    const time = Number(times.get(name)) || 1;
    const output = outputs.get(name);

    return { output: output, time: time, name: name };
  }
};
