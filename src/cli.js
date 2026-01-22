const { Command } = require("commander");
const pkg = require("../package.json");
const { initCommand } = require("./commands/init");
const { logCommand } = require("./commands/log");
const { listCommand } = require("./commands/list");
const { showCommand } = require("./commands/show");
const { statsCommand } = require("./commands/stats");
const { checkCommand } = require("./commands/check");
const { configCommand } = require("./commands/config");
const { deleteCommand } = require("./commands/delete");
const { exportCommand } = require("./commands/export");

const program = new Command();

program
  .name("reme")
  .description(pkg.description)
  .version(pkg.version)
  .option("--json", "Output JSON")
  .option("--verbose", "Verbose output")
  .option("--quiet", "Minimal output");

program.addCommand(initCommand());
program.addCommand(logCommand());
program.addCommand(listCommand());
program.addCommand(showCommand());
program.addCommand(statsCommand());
program.addCommand(checkCommand());
program.addCommand(configCommand());
program.addCommand(deleteCommand());
program.addCommand(exportCommand());

program.parse(process.argv);
