//Change all the configurations inside of your .env file
//This file is just for guidance of what the configuration do
//Do not change anything in this file!!

require("dotenv").config();
let configuration = {
  // Your twitch channel name, as shown in your twitch.tv/channel_name url. Should be lowercase!
  CHANNEL: process.env.CHANNEL,

  ///////////////////////////////////////////////////////////////
  // ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ CONFIG EXPLANATION ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ //
  /////////////////////////////////////////////////////////////
  // Will be overwritten by individual game configurations! //
  ///////////////////////////////////////////////////////////

  // Timed mode will output the most inputted action every INTERVAL seconds.
  // Chaos mode will output all inputs, waits TIMEOUT seconds before the same user is able to input again.
  TIMED_MODE: true, // true = timed mode, false = chaos mode || Will be overwritten by inputs file

  ///// TIMED MODE \\\\\

  // true = will only start interval timer when someone sends a message || RECOMMENDED
  // false = Will continuously run on interval, sometimes allowing chatters to sneak in their own input, without being affected by other chatters.
  //TIMED_ON_INPUT = "true"
  TIMED_ON_INPUT: true,

  //INTERVAL = "2"
  INTERVAL: 2,

  ///// CHAOS MODE \\\\\
  // TIMEOUT = "2"
  TIMEOUT: 2,

  ///// OTHER \\\\\
  // WINDOW = ["Dolphin", "RMCE01"]
  WINDOW: ["Dolphin"], // Window name must include all these words for the inputs to register, to prevent chat from taking over your computer.
};

console.log();

if (process.env.TIMED_MODE != undefined)
  configuration.TIMED_MODE = process.env.TIMED_MODE?.toLowerCase() === "true";

if (process.env.TIMED_ON_INPUT != undefined)
  configuration.TIMED_ON_INPUT =
    process.env.TIMED_ON_INPUT?.toLowerCase() === "true";

if (process.env.INTERVAL != undefined)
  configuration.INTERVAL = Number(process.env.INTERVAL);

if (process.env.TIMEOUT != undefined)
  configuration.TIMEOUT = Number(process.env.TIMEOUT);

if (process.env.WINDOW != undefined)
  configuration.WINDOW = JSON.parse(process.env.WINDOW);

module.exports = {
  getConfiguration: () => configuration,
  updateConfiguration: (updatedValues) => {
    configuration = { ...configuration, ...updatedValues };
  },
};
require("./src/index.js");
