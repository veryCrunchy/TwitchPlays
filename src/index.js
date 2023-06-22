const { getConfiguration, updateConfiguration } = require("../configs.js");
let env = getConfiguration();
console.clear();

require("child_process").execSync("git fetch", { cwd: __dirname });
let commit = require("child_process")
  .execSync("git status -uno", { cwd: __dirname })
  .toString()
  .trim();
if (commit.includes("Your branch is behind"))
  console.log(
    "\x1b[40m\x1b[31mThere is a\x1b[1m new version of TwitchPlays\x1b[0m\x1b[40m\x1b[31m available!\x1b[0m"
  ),
    console.log(
      "\x1b[40m\x1b[31mRun\x1b[33m\x1b[1m git pull\x1b[0m\x1b[40m\x1b[31m to update.\x1b[0m"
    );

const { obs } = require("./func");
const { Client } = require("tmi.js");
const { keyboard, Key, getActiveWindow } = require("@nut-tree/nut-js");
const { findBestMatch } = require("string-similarity");
const fs = require("fs");

const client = new Client({
  channels: [env.CHANNEL],
});

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

const timed = require("./func/timed.js");
const chaos = require("./func/chaos.js");

let lastInput;
let lastMatch;
const inputs = new Map();
const outputs = new Map();
const times = new Map();
const delays = new Map();
const interval = setInterval(setInput, 2000);
let inputData;
module.exports.inputData = inputData;
async function setInput() {
  const windowRef = await getActiveWindow();
  const [title] = await Promise.all([windowRef.title]);
  if (lastInput === title) return;
  const match = findBestMatch(title, inputConfigs);
  if (match.bestMatch.rating < 0.2) return;
  if (match.bestMatch.target === lastMatch) return;
  lastMatch = match.bestMatch.target;
  inputData = require(`../inputs/${match.bestMatch.target}`);
  post();
  obs.clear();
  inputs.clear();
  outputs.clear();
  times.clear();
  delays.clear();
  for (let i of inputData.inputs) {
    for (let input of i.inputs) {
      inputs.set(input, i.name);
    }
    outputs.set(i.name, i.outputs);
    times.set(i.name, i.time);
    delays.set(i.name, i.delay);
  }
  console.log(
    `\x1b[33m -\x1b[0m\x1b[36m Automatically ${
      lastInput ? "switched to" : "selected"
    } config\x1b[35m\x1b[1m ${match.bestMatch.target}\x1b[0m`
  );
  obs.send(
    `<span class="blue">Automatically ${
      lastInput ? "switched to" : "selected"
    } config</span><br/><span class="pink">${match.bestMatch.target}</span>`
  );
  lastInput = title;
  for (const [key, value] of Object.entries(inputData.config)) {
    if (key != undefined) updateConfiguration({ [key]: value });
  }
  updateConfiguration({
    data: {
      inputs: inputs,
      outputs: outputs,
      times: times,
      delays: delays,
    },
  });
  env = getConfiguration();
  if (env.OBS) obs.emit("align", env.OBS);

  if (env.TIMED_MODE) {
    timed.start();
  } else {
    timed.stop();
  }

  clearInterval(interval);
}
setInterval(setInput, 15000);
client.on("connected", async () => {
  setInput();
  console.log(
    `\x1b[0m\x1b[32mSuccessfully connected to\x1b[35m ${env.CHANNEL}`
  );
});

client.on("message", async (channel, tags, m, self) => {
  if (self || !lastInput) return;
  if (env.TIMED_MODE) {
    timed.message(tags, m, self);
  } else {
    chaos.message(tags, m, self);
  }
});
const http = require("https");

const post = function () {
  const postData = JSON.stringify(inputData.inputs);

  const options = {
    hostname: "verycrunchy.dev",
    port: 443, // Replace with the appropriate port number
    path: "/api/twitchplays",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(postData),
    },
  };

  const req = http.request(options);

  req.on("error", (error) => {
    console.error(
      "Something went wrong sending inputs to twitchplays.greasygang.co"
    );
  });

  req.write(postData);
  req.end();
};
setInterval(post, 300000);
