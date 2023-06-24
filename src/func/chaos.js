const { go, obs, getConfiguration } = require("./");
const { Key, getActiveWindow } = require("@nut-tree/nut-js");
let tempUser = new Map();
let preserved = false;
async function message(tags, m, self) {
  let user = tempUser.get(tags.username);
  if (user) return;
  const env = getConfiguration();

  const windowRef = await getActiveWindow();
  const [title] = await Promise.all([windowRef.title]);
  const keywords = env.WINDOW;
  if (
    !keywords
      .map((keyword) => keyword.toLowerCase())
      .every((keyword) => title.toLowerCase().includes(keyword))
  ) {
    if (!preserved)
      console.log(
        "\x1b[2m\x1b[33mNot focused on correct window, cancelled input.\x1b[0m"
      ),
        obs.send(
          `<span class="yellow edim">Not focused on correct window, cancelled input.</span>`
        ),
        (preserved = true);
    return;
  }
  preserved = false;

  if (env.TIMEOUT !== 0) {
    tempUser.set(tags.username, true);
    setTimeout(function () {
      tempUser.delete(tags.username);
    }, env.TIMEOUT * 1000);
  }

  let { name } = go.getMatch(m);
  if (!name) return;
  let chance = env.data.chances.get(name) || undefined;
  if (chance != undefined && Math.random() * 100 > env.data.chances.get(name)) {
    return obs.send(
      `<span style="color: ${tags.color}">${tags.username}</span> <span class="red">${name}</span>`
    );
  }

  console.log(`\x1b[34m${tags.username}:\x1b[33m ${name}\x1b[0m`);
  obs.send(
    `<span style="color: ${tags.color}">${tags.username}</span> <span class="yellow">${name}</span>`
  );
  go.manage(name);
}

module.exports = { message };
