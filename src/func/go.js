const {
  Key,
  Point,
  keyboard,
  mouse,
  screen,
  left,
  right,
  up,
  down,
  straightTo,
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
mouse.config.mouseSpeed = 2000;

async function manage(name) {
  console.log(await mouse.getPosition());
  const env = getConfiguration();
  const times = env.data.times.get(name);
  const delays = env.data.delays.get(name);

  for (let [i, press] of env.data.outputs.get(name).entries()) {
    let delay = 0;
    if (delays) {
      delay = delays[i];
    }
    switch (true) {
      case press.startsWith("mouse"):
        moveMouseToCenter();
        break;
      case press.startsWith("left"): {
        let m = Number(press.match(/left\((\d+)\)/)[1]);
        goMouse(left(m), delay);
        break;
      }
      case press.startsWith("right"): {
        let m = Number(press.match(/right\((\d+)\)/)[1]);
        goMouse(right(m), delay);
        break;
      }
      case press.startsWith("up"): {
        let m = Number(press.match(/up\((\d+)\)/)[1]);
        goMouse(up(m), delay);
        break;
      }
      case press.startsWith("down"): {
        let m = Number(press.match(/down\((\d+)\)/)[1]);
        goMouse(down(m), delay);
        break;
      }
      case press.startsWith("type"): {
        let m = press.match(/type\((.+)\)/)[1];
        if (delay) {
          setTimeout(async () => {
            keyboard.type(m);
          }, delay * 1000);
        } else {
          keyboard.type(m);
        }
        break;
      }
      default: {
        const time = times[i];
        if (delay) {
          if (time == 0) {
            setTimeout(() => {
              keyboard.pressKey(Key[press]);
              setTimeout(() => keyboard.releaseKey(Key[press]), 70);
            }, delay * 1000);
          } else {
            setTimeout(() => {
              hold(Key[press], time);
            }, delay * 1000);
          }
        } else if (time == 0) {
          keyboard.pressKey(Key[press]);
          setTimeout(() => keyboard.releaseKey(Key[press]), 70);
        } else {
          hold(Key[press], time);
        }
        break;
      }
    }
  }
}

async function goMouse(func, m, delay) {
  if (delay) {
    setTimeout(async () => {
      mouse.move(func);
    }, delay * 1000);
  } else {
    mouse.move(func);
  }
}

async function mouseImage(path) {
  await mouse.move(
    straightTo(centerOf(screen.find(imageResource(`../../img/${path}`))))
  );
}

async function moveMouseToCenter() {
  const centerX = Math.round((await screen.width()) / 2);
  const centerY = Math.round((await screen.height()) / 2);
  console.log(screen.height());
  let m = await mouse.move(straightTo(new Point(centerX, centerY)));
  console.log(m);
}

module.exports = { hold, getMatch, manage };
