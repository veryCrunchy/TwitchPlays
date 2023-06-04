const tmi = require("tmi.js");
const { keyboard, Key, getActiveWindow } = require("@nut-tree/nut-js");
const { distance, closestMatch } = require("closest-match");
const fs = require("fs");
require("dotenv").config();

const env = {
  CHANNEL: process.env.CHANNEL || "nil",
  MODE: process.env.MODE || "nil",
  TIMED_INTERVAL: process.env.MODE || "nil",
};
if (Object.values(env).includes("nil"))
  return console.error(
    "\x1b[40m\x1b[31mNot all\x1b[33m .ENV\x1b[31m variables are defined!\x1b[0m\n" +
      "\x1b[40m\x1b[31mPlease check the\x1b[33m .env\x1b[31m file.\x1b[0m\n" +
      "\x1b[40m\x1b[31mFor guidance, see \x1b[33m.env.example\x1b[31m.\x1b[0m"
  );

const client = new tmi.Client({
  channels: [env.CHANNEL],
});

let inputConfigs = [];
for (let config of fs
  .readdirSync(`./inputs/`)
  .filter((file) => file.endsWith(".json"))) {
  inputConfigs.push(config);
}
if (!inputConfigs.length)
  return (
    console.error(
      "\x1b[0m\x1b[40m\x1b[31mYou do not have any\x1b[33m input\x1b[31m configuration files!\x1b[0m\n" +
        "\x1b[40m\x1b[31mPlease check the\x1b[33m inputs/README\x1b[31m file.\x1b[0m\n"
    ),
    process.exit()
  );

////////////////////////////////
// AUTOMATIC INPUT SWITCHER
////////////////////////////////
let lastInput;
const inputs = new Map();
const outputs = new Map();
const times = new Map();

setInput = async () => {
  const windowRef = await getActiveWindow();
  const [title] = await Promise.all([windowRef.title]);
  if (!title.includes("Dolphin")) return;
  if (lastInput === title) return;
  let match = closestMatch(title, inputConfigs);
  const inputData = require(`./inputs/${match}`);
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
  lastInput = title;
  console.log(
    `\x1b[33m -\x1b[0m\x1b[36m Switched to config\x1b[35m ${match}\x1b[32m\x1b[0m`
  );
};
setInterval(setInput, 15000);

console.log(
  `\x1b[2m\x1b[36mAttempting to connect to channel;\x1b[35m ${env.CHANNEL} \x1b[2m\x1b[33m`
);
client.connect();

client.on("connected", async () => {
  setInput();
  console.log(
    `\x1b[0m\x1b[32mSuccessfully connected to \x1b[35m${env.CHANNEL}`
  );
  console.log(
    `\x1b[0m\x1b[32mStarted in \x1b[33m${env.MODE} \x1b[32mmode.\x1b[0m`
  );
});
////////////////////////////////
// TIMED MODE
////////////////////////////////
if (env.MODE === "TIMED") {
  tempMap = new Map();
  tempUser = [];
  client.on("message", async (channel, tags, m, self) => {
    let { output, name } = getMatch(m);
    if (!name) return;
    let map = tempMap.get(name);
    let user = tempUser.find((u) => u === tags.username);
    if (user) return;
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
    const [title, region] = await Promise.all([
      windowRef.title,
      windowRef.region,
    ]);
    if (!title.includes("Dolphin"))
      return console.log(
        "\x1b[2m\x1b[33mIncorrect window, input preserved\x1b[0m"
      );
    let highestValue = -Infinity;
    let highestKey = null;
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
    console.log("\x1b[36mCollective input: \x1b[35m" + highestKey);
    let time = times.get(highestKey);
    tempMap.clear();
    tempUser = [];
    hold(Key[outputs.get(highestKey)], time);
  }, env.TIMED_INTERVAL * 1000);
}
////////////////////////////////
// CHAOS MODE
////////////////////////////////
if (env.MODE === "CHAOS") {
  client.on("message", async (channel, tags, m, self) => {
    if (self) return;
    console.log(`@${tags.username}: ${m}`);

    const windowRef = await getActiveWindow();
    const [title, region] = await Promise.all([
      windowRef.title,
      windowRef.region,
    ]);
    if (!title.includes("Dolphin"))
      return console.log(
        "\x1b[2m\x1b[33mIncorrect window, cancelled input.\x1b[0m"
      );

    let { output, time } = getMatch(m);

    hold(Key[output], time);
  });
}

hold = async (keys, seconds) => {
  const startTime = Date.now();
  await keyboard.pressKey(keys);
  seconds = seconds * 1000 - (Date.now() - startTime);
  setTimeout(async function () {
    await keyboard.releaseKey(keys);
  }, seconds);
};
release = async (keys) => {
  await keyboard.releaseKey(keys);
};
getMatch = (m) => {
  m = m.trim().toLowerCase();
  const closest = closestMatch(m, Array.from(inputs.keys()));
  const name = inputs.get(closest);
  const time = times.get(name);
  const output = outputs.get(name);
  return { output: output, time: time, name: name };
};
