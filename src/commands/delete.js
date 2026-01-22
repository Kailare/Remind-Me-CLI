const { Command } = require("commander");
const { deletePrediction, getPredictionById } = require("../lib/db");

function deleteCommand() {
  const cmd = new Command("delete")
    .description("Delete a prediction")
    .argument("<id>", "Prediction ID")
    .action((id) => {
      const existing = getPredictionById(id);
      if (!existing) {
        console.error("??? Prediction not found.");
        process.exit(1);
      }

      const deleted = deletePrediction(id);
      if (!deleted) {
        console.error("??? Failed to delete prediction.");
        process.exit(1);
      }

      console.log(`??????? Deleted prediction ${id}.`);
    });

  return cmd;
}

module.exports = { deleteCommand };
