const {
  keyboard,
  Key,
  mouse,
  left,
  right,
  up,
  down,
} = require("@nut-tree/nut-js");
const { findBestMatch } = require("string-similarity");
const { getConfiguration } = require("../../configs.js");
let holding = new Map();
async function hold(keys, seconds) {
  keyboard.pressKey(keys);
  let hold = holding.get(keys);
  hold == undefined ? holding.set(keys, 1) : holding.set(keys, hold + 1);
  setTimeout(async function () {
    hold = holding.get(keys);
    if (hold === 1) {
      keyboard.releaseKey(keys);
      holding.set(keys, hold - 1);
    } else holding.set(keys, hold - 1);
  }, seconds * 1000);
}
function getMatch(m) {
  if (typeof m != "string" || m == null)
    return { output: undefined, time: undefined, name: undefined };
  m = m.trim().toLowerCase();
  const data = getConfiguration().data;

  let match = findBestMatch(m, Array.from(data.inputs.keys()));
  if (match) {
    if (match.bestMatch.rating < 0.5)
      return { output: undefined, time: undefined, name: undefined };
    match = match.bestMatch.target;
  } else return;

  const name = data.inputs.get(match);
  const time = Number(data.times.get(name)) || 1;
  const output = data.outputs.get(name);

  return { output: output, time: time, name: name };
}

async function manage(name) {
  const env = getConfiguration();
  const times = env.data.times.get(name);
  const delays = env.data.delays.get(name);
  for (let [i, press] of env.data.outputs.get(name).entries()) {
    let delay = 0;
    if (delays) {
      delay = delays[i];
    }
    if (press.startsWith("left")) {
      let m = press.match(/left\((\d+)\)/)[1];
      if (delay) {
        setTimeout(async () => {
          mouse.move(left(m));
        }, delay * 1000);
      } else mouse.move(left(m));
    } else if (press.startsWith("right")) {
      let m = press.match(/right\((\d+)\)/)[1];
      if (delay) {
        setTimeout(async () => {
          mouse.move(right(m));
        }, delay * 1000);
      } else mouse.move(right(m));
    } else if (press.startsWith("up")) {
      let m = press.match(/up\((\d+)\)/)[1];
      if (delay) {
        setTimeout(async () => {
          mouse.move(up(m));
        }, delay * 1000);
      } else mouse.move(up(m));
    } else if (press.startsWith("down")) {
      let m = press.match(/down\((\d+)\)/)[1];
      if (delay) {
        setTimeout(async () => {
          mouse.move(down(m));
        }, delay * 1000);
      } else mouse.move(down(m));
    } else if (press.startsWith("type")) {
      let m = press.match(/type\((.+)\)/)[1];
      if (delay) {
        setTimeout(async () => {
          keyboard.type(m);
        }, delay * 1000);
      } else keyboard.type(m);
    } else {
      const time = times[i];
      if (delay) {
        if (time < 0.3) {
          setTimeout(() => {
            keyboard.pressKey(Key[press]);
            setTimeout(() => keyboard.releaseKey(Key[press]), 70);
          }, delay * 1000);
        } else
          setTimeout(() => {
            hold(Key[press], time);
          }, delay * 1000);
      } else if (time < 0.3) {
        keyboard.pressKey(Key[press]);
        setTimeout(() => keyboard.releaseKey(Key[press]), 70);
      } else hold(Key[press], time);
    }
  }
}

async function mouseImage(path) {
  await mouse.move(
    straightTo(centerOf(screen.find(imageResource(`../../img/${path}`))))
  );
}

module.exports = { hold, getMatch, manage };
