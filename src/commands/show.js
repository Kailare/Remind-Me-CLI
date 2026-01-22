const { Command } = require("commander");
const { getPredictionById, findPredictionByMarket } = require("../lib/db");
const {
  formatDate,
  oddsDisplay,
  pointsDisplay,
  statusBadge,
  statusLabel
} = require("../utils/format");

function showCommand() {
  const cmd = new Command("show")
    .description("Show prediction details")
    .argument("[id]", "Prediction ID")
    .option("--market <text>", "Search by market text")
    .action((id, options) => {
      let prediction = null;

      if (id) {
        prediction = getPredictionById(id);
      } else if (options.market) {
        prediction = findPredictionByMarket(options.market);
      }

      if (!prediction) {
        console.error("??? Prediction not found.");
        process.exit(1);
      }

      console.log("");
      console.log(`???? Prediction ${prediction.id}`);
      console.log("");
      console.log(`Market: ${prediction.market_question}`);
      console.log(`URL: ${prediction.market_url}`);
      console.log(`Your call: ${prediction.predicted_outcome}`);
      if (prediction.confidence != null) {
        console.log(`Confidence: ${prediction.confidence}%`);
      }
      console.log(`Odds at prediction: ${oddsDisplay(prediction.odds_at_prediction)}`);
      console.log("");
      console.log(
        `Status: ${statusBadge(prediction.status, prediction.is_correct)} ${statusLabel(
          prediction.status,
          prediction.is_correct
        )}`
      );
      if (prediction.winning_outcome) {
        console.log(`Result: ${prediction.winning_outcome}`);
      }
      if (prediction.points != null) {
        console.log(`Points: ${pointsDisplay(prediction.points)}`);
      }
      console.log("");
      console.log(`Logged: ${formatDate(prediction.created_at)}`);
      if (prediction.resolved_at) {
        console.log(`Resolved: ${formatDate(prediction.resolved_at)}`);
      }
      if (prediction.notes) {
        console.log(`Notes: ${prediction.notes}`);
      }
    });

  return cmd;
}

module.exports = { showCommand };
