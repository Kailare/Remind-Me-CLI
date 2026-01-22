const { Command } = require("commander");
const { listPredictions } = require("../lib/db");
const { createTable } = require("../utils/table");
const { statusBadge, pointsDisplay, oddsDisplay } = require("../utils/format");

function listCommand() {
  const cmd = new Command("list")
    .description("List predictions")
    .option("--pending", "Show pending")
    .option("--resolved", "Show resolved")
    .option("--correct", "Show correct")
    .option("--incorrect", "Show incorrect")
    .option("--limit <number>", "Limit results")
    .action((options) => {
      let status = null;
      let isCorrect = null;
      let resolved = null;
      if (options.pending) status = "pending";
      if (options.resolved) resolved = true;
      if (options.correct) isCorrect = true;
      if (options.incorrect) isCorrect = false;

      const limit = options.limit ? Number(options.limit) : null;
      const predictions = listPredictions({ status, isCorrect, resolved, limit });

      const table = createTable([
        "ID",
        "Market",
        "Call",
        "Odds",
        "Status",
        "Points"
      ]);

      predictions.forEach((pred, index) => {
        table.push([
          pred.id.slice(0, 6) || index + 1,
          pred.market_question,
          pred.predicted_outcome,
          oddsDisplay(pred.odds_at_prediction),
          statusBadge(pred.status, pred.is_correct),
          pointsDisplay(pred.points)
        ]);
      });

      console.log(table.toString());
    });

  return cmd;
}

module.exports = { listCommand };
