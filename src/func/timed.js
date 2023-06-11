const { getConfiguration, client, go, obs } = require("./");
const { Key, getActiveWindow } = require("@nut-tree/nut-js");
let off = "neutral";
let env = getConfiguration();
const tempMap = new Map();
let tempUser = [];
let preserved = false;

function message(tags, m, self) {
  let user = tempUser.find((u) => u === tags.username);
  if (user) return;
  let { name } = go.getMatch(m);
  if (!name) return;
  if (env.TIMED_ON_INPUT && !tempMap.size)
    setTimeout(startInterval, env.INTERVAL * 1000);
  let map = tempMap.get(name);
  console.log(`\x1b[2m\x1b[34m${tags.username} chose:\x1b[33m ${name}\x1b[0m`);
  obs.send(
    `<span class="dim"><span style="color: ${tags.color}">${tags.username}</span> <span class="yellow">${name}</span></span>`
  );
  tempUser.push(tags.username);
  if (!map) {
    tempMap.set(name, 1);
  } else {
    tempMap.set(name, map + 1);
  }
}
function start() {
  if (!off && off != "neutral") return;
  clearPreserved();
  off = false;
  startInterval();
  console.log(
    `\x1b[0m\x1b[32mEnabled\x1b[33m TIMED\x1b[32m mode on\x1b[33m ${env.INTERVAL}\x1b[0m`
  );
  obs.send(
    `<span class="green">Enabled <span class="yellow">TIMED</span> mode on <span class="yellow">${env.INTERVAL}</span>s</span>`
  );
}
function stop() {
  if (off === true) return;
  clearPreserved();
  off = true;
  console.log(`\x1b[0m\x1b[32mEnabled\x1b[33m CHAOS\x1b[32m mode.\x1b[0m`);
  obs.send(
    `<span class="green">Enabled <span class="yellow">CHAOS</span> mode</span>`
  );
}

async function startInterval() {
  env = getConfiguration();
  if (!off && !env.TIMED_ON_INPUT) {
    setTimeout(startInterval, env.INTERVAL * 1000);
  } else if (!env.TIMED_MODE) return;

  if (!tempMap.size) return;
  const windowRef = await getActiveWindow();
  const [title] = await Promise.all([windowRef.title]);
  const keywords = env.WINDOW;
  if (
    !keywords
      .map((keyword) => keyword.toLowerCase())
      .every((keyword) => title.toLowerCase().includes(keyword))
  ) {
    if (env.TIMED_MODE) setTimeout(startInterval, 1000);
    if (!preserved)
      console.log(
        "\x1b[2m\x1b[33mNot focused on correct window, input preserved\x1b[0m"
      ),
        obs.send(
          `<span class="yellow edim">Not focused on correct window, input preserved</span>`
        ),
        (preserved = true),
        setTimeout(clearPreserved, 15000);
    return;
  }
  preserved = false;
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
    const randomIndex = Math.floor(Math.random() * keysWithHighestValue.length);
    highestKey = keysWithHighestValue[randomIndex];
  }
  console.log(`\x1b[36mCollective input:\x1b[35m ${highestKey}\x1b[0m`);
  obs.send(
    `<span class="blue">Collective input</span> <span class="pink">${highestKey}</span>`
  );
  tempMap.clear();
  tempUser = [];
  go.manage(highestKey);
}
function clearPreserved() {
  if (preserved) {
    tempMap.clear();
    tempUser = [];
    console.log("\x1b[2m\x1b[33mTook too long, input discarded\x1b[0m");
    obs.send(`<span class="yellow edim">Took too long, input discarded</span>`);
    preserved = false;
  }
}

module.exports = { start, stop, message };
