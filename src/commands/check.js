const { Command } = require("commander");
const ora = require("ora");
const { getPendingPredictions, updatePredictionResolution } = require("../lib/db");
const { getMarket, parseMarketSlug } = require("../lib/polymarket");
const { computeFinalPoints } = require("../lib/scoring");
const { formatDate } = require("../utils/format");

async function checkOnce() {
  const pending = getPendingPredictions();
  if (!pending.length) {
    console.log("No pending predictions.");
    return;
  }

  console.log(`Checking ${pending.length} pending predictions...`);

  for (const pred of pending) {
    const spinner = ora(`Checking ${pred.market_question}...`).start();
    try {
      const slug = pred.market_slug || parseMarketSlug(pred.market_url);
      if (!slug) {
        spinner.fail("Missing market slug for prediction.");
        continue;
      }

      const market = await getMarket(slug);
      const status = market.status || "active";
      const winning = market.winning_outcome || market.result;

      if (status !== "resolved" && status !== "closed" && !winning) {
        spinner.succeed("No resolution yet.");
        continue;
      }

      const hasWinning = winning != null;
      const isCorrect = hasWinning
        ? pred.predicted_outcome.toUpperCase() === String(winning).toUpperCase()
        : null;
      const points = hasWinning
        ? computeFinalPoints({
            oddsAtPrediction: pred.odds_at_prediction,
            isCorrect,
            confidence: pred.confidence
          })
        : null;

      const resolvedAt = new Date().toISOString();
      updatePredictionResolution({
        id: pred.id,
        status: "resolved",
        winning_outcome: winning,
        is_correct: isCorrect == null ? null : isCorrect ? 1 : 0,
        points: points == null ? null : points,
        resolved_at: resolvedAt
      });

      spinner.succeed(`RESOLVED: ${market.question || pred.market_question}`);
      console.log(`Result: ${winning}`);
      console.log(`Your call: ${pred.predicted_outcome}`);
      console.log(`Points: ${points}`);
      console.log(`Resolved: ${formatDate(resolvedAt)}`);
      console.log("");
    } catch (error) {
      spinner.fail(`Error checking ${pred.market_question}`);
      console.error(error.message || error);
    }
  }
}

function checkCommand() {
  const cmd = new Command("check")
    .description("Check for resolved markets")
    .option("--watch", "Keep checking")
    .option("--interval <seconds>", "Check interval (default 3600)")
    .action(async (options) => {
      const intervalSeconds = options.interval
        ? Number(options.interval)
        : 3600;
      if (Number.isNaN(intervalSeconds) || intervalSeconds <= 0) {
        console.error("??? Interval must be a positive number of seconds.");
        process.exit(1);
      }

      if (!options.watch) {
        await checkOnce();
        return;
      }

      await checkOnce();
      console.log(`Watching for resolutions every ${intervalSeconds}s...`);
      setInterval(() => {
        checkOnce().catch((error) => {
          console.error(error.message || error);
        });
      }, intervalSeconds * 1000);
    });

  return cmd;
}

module.exports = { checkCommand };
