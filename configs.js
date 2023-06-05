const configuration = {
  // Your twitch channel name, as shown in your twitch.tv/channel_name url. Should be lowercase!
  CHANNEL: "greasymac",

  // Timed mode will output the most inputted action every INTERVAL seconds.
  // Chaos mode will output all inputs, waits TIMEOUT seconds before the same user is able to input again.
  TIMED_MODE: true, // true = timed mode, false = chaos mode || default: true

  ///// TIMED MODE CONFIG \\\\\
  INTERVAL: 2, // default: 2

  ///// CHAOS MODE CONFIG \\\\\
  TIMEOUT: 2, // default: 2
};

require("./src/index.js")(configuration);
