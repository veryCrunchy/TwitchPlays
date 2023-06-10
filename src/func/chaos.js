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

  tempUser.set(tags.username, true);
  setTimeout(function () {
    tempUser.delete(tags.username);
  }, env.TIMEOUT * 1000);

  let { output, time, name } = go.getMatch(m);
  if (!output) return;
  console.log(`\x1b[34m${tags.username}:\x1b[33m ${name}\x1b[0m`);
  obs.send(
    `<span style="color: ${tags.color}">${tags.username}</span> <span class="yellow">${name}</span>`
  );
  go.hold(Key[output], time);
}

module.exports = { message };
