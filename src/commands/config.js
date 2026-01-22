const { Command } = require("commander");
const { DEFAULT_CONFIG, loadConfig, saveConfig } = require("../lib/config");

function parseValue(value) {
  if (value === "null") return null;
  if (value === "true") return true;
  if (value === "false") return false;
  if (!Number.isNaN(Number(value)) && value.trim() !== "") {
    return Number(value);
  }
  return value;
}

function configCommand() {
  const cmd = new Command("config").description("View or edit config");

  cmd
    .command("set")
    .description("Set config value")
    .argument("<key>", "Config key, e.g. api_enabled")
    .argument("<value>", "Config value")
    .action((key, value) => {
      const config = loadConfig();
      if (!(key in DEFAULT_CONFIG)) {
        console.error(`??? Unknown config key: ${key}`);
        process.exit(1);
      }
      config[key] = parseValue(value);
      saveConfig(config);
      console.log(`??? Updated ${key}`);
    });

  cmd.action(() => {
    const config = loadConfig();
    console.log(JSON.stringify(config, null, 2));
  });

  return cmd;
}

module.exports = { configCommand };
