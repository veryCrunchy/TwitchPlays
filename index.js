const tmi = require("tmi.js");
const { keyboard, Key, getActiveWindow } = require("@nut-tree/nut-js");
const { distance, closestMatch } = require("closest-match");

require("dotenv").config();

const env = {
  CHANNEL: process.env.CHANNEL || "nil",
  MODE: process.env.MODE || "nil",
  TIMED_INTERVAL: process.env.MODE || "nil",
};
if (Object.values(env).includes("nil"))
  return console.error(
    "\x1b[40m\x1b[31mNot all \x1b[33m.ENV \x1b[31mvariables are defined!\x1b[0m\n" +
      "\x1b[40m\x1b[31mPlease check the \x1b[33m.env \x1b[31mfile.\x1b[0m\n" +
      "\x1b[40m\x1b[31mFor guidance, see \x1b[33m.env.example\x1b[31m.\x1b[0m"
  );
console.log(
  `\x1b[2m\x1b[36mAttempting to connect to channel;\x1b[35m ${env.CHANNEL} \x1b[2m\x1b[33m`
);
const client = new tmi.Client({
  channels: [env.CHANNEL],
});

client.connect();

const inputData = [
  {
    name: "drive",
    inputs: ["drive", "forward", "w", "go", "d"],
    outputs: "Num2",
    time: 2,
  },
  {
    name: "break",
    inputs: ["break", "b", "stop"],
    outputs: "A",
    time: 1,
  },
  {
    name: "back",
    inputs: ["back", "backward", "s", "reverse"],
    outputs: "B",
    time: 2,
  },
  {
    name: "sl",
    inputs: ["sl", "slight left", "small left"],
    outputs: "LeftBracket",
    time: 0.3,
  },
  {
    name: "sr",
    inputs: ["sr", "slight right", "small right"],
    outputs: "RightBracket",
    time: 0.3,
  },
  {
    name: "l",
    inputs: ["l", "left"],
    outputs: "LeftBracket",
    time: 0.7,
  },
  {
    name: "r",
    inputs: ["r", "right"],
    outputs: "RightBracket",
    time: 0.7,
  },
  {
    name: "bl",
    inputs: ["bl", "big left"],
    outputs: "LeftBracket",
    time: 1.2,
  },
  {
    name: "br",
    inputs: ["br", "big right"],
    outputs: "RightBracket",
    time: 1.2,
  },
];

let inputs = new Map();
let outputs = new Map();
let times = new Map();
for (let i of inputData) {
  for (let input of i.inputs) {
    inputs.set(input, i.name);
  }
  outputs.set(i.name, i.outputs);
  times.set(i.name, i.time);
}
client.on("connected", async () => {
  console.log(
    `\x1b[0m\x1b[32mSuccessfully connected to \x1b[35m${env.CHANNEL}`
  );
  console.log(
    `\x1b[0m\x1b[32mStarted in \x1b[33m${process.env.MODE} \x1b[32mmode.\x1b[0m`
  );
});
////////////////////////////////
// TIMED MODE
////////////////////////////////
if (env.MODE === "TIMED") {
  tempMap = new Map();
  client.on("message", async (channel, tags, m, self) => {
    let { output, name } = getMatch(m);
    if (!name) return;
    let map = tempMap.get(name);
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
    let time = times.get(highestKey);
    tempMap.clear();
    hold(Key[outputs.get(highestKey)], time);
  }, process.env.TIMED_INTERVAL * 1000);
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
  console.log("pressed");
  seconds = seconds * 1000 - (Date.now() - startTime);
  console.log(seconds);
  setTimeout(async function () {
    console.log("releasing");
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
