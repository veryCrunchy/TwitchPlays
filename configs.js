let configuration = {
  // Your twitch channel name, as shown in your twitch.tv/channel_name url. Should be lowercase!
  CHANNEL: "greasymac",

  ////////////////////////////////////////////////////////
  //↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ DEFAULT CONFIGS ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓//
  //////////////////////////////////////////////////////
  // Will be overwritten by per game configurations! //
  ////////////////////////////////////////////////////

  // Timed mode will output the most inputted action every INTERVAL seconds.
  // Chaos mode will output all inputs, waits TIMEOUT seconds before the same user is able to input again.
  TIMED_MODE: true, // true = timed mode, false = chaos mode || Will be overwritten by inputs file

  ///// TIMED MODE CONFIG \\\\\

  // true = will only start interval timer when someone sends a message, allowing for others to adjust || RECOMMENDED
  // false = Will continuously run on interval, sometimes allowing chatters to sneak in their own command, without being affected by other chatters.
  TIMED_ON_INPUT: true,

  INTERVAL: 2, // default: 2 || Will be overwritten by inputs file

  ///// CHAOS MODE CONFIG \\\\\
  TIMEOUT: 2, // default: 2 || Will be overwritten by inputs file

  ///// OTHER CONFIG \\\\\
  WINDOW: ["Dolphin"], // Window name must include all these words, for example: ["Dolphin", "RMWE20"] for M&M Kart Racing
};

module.exports = {
  getConfiguration: () => configuration,
  updateConfiguration: (updatedValues) => {
    configuration = { ...configuration, ...updatedValues };
  },
};
require("./src/index.js");
