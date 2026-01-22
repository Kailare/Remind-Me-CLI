const { Command } = require("commander");
const inquirer = require("inquirer");
const { DEFAULT_CONFIG, loadConfig, saveConfig, ensureDataDirs } = require("../lib/config");
const { getDb } = require("../lib/db");

function initCommand() {
  const cmd = new Command("init")
    .description("Initialize Remind Me config and database")
    .action(async () => {
      const existing = loadConfig();
      const answers = await inquirer.prompt([
        {
          type: "input",
          name: "default_confidence",
          message: "Default confidence (1-100, optional):",
          validate: (val) => {
            if (!val) return true;
            const num = Number(val);
            if (Number.isNaN(num) || num < 1 || num > 100) {
              return "Enter a number between 1 and 100.";
            }
            return true;
          }
        }
      ]);

      const config = {
        ...DEFAULT_CONFIG,
        ...existing,
        default_confidence: answers.default_confidence
          ? Number(answers.default_confidence)
          : existing.default_confidence
      };

      saveConfig(config);
      ensureDataDirs();
      getDb();

      console.log("??? Initialized Remind Me config and data directory.");
    });

  return cmd;
}

module.exports = { initCommand };
