const { getConfiguration, updateConfiguration } = require("../../configs.js");
const { obs } = require("./obs.js");
const go = require("./go.js");

module.exports = {
  obs,
  go,
  getConfiguration,
  updateConfiguration,
};
