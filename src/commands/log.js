const { Command } = require("commander");
const inquirer = require("inquirer");
const ora = require("ora");
const crypto = require("crypto");
const { loadConfig, ensureDataDirs } = require("../lib/config");
const { insertPrediction } = require("../lib/db");
const { parseMarketSlug, getMarket, getPrices, normalizeOdds } = require("../lib/polymarket");
const { validatePrediction, validateMarketUrl } = require("../utils/validate");
const { formatDate, oddsDisplay } = require("../utils/format");

async function promptForInputs() {
  return inquirer.prompt([
    {
      type: "input",
      name: "url",
      message: "Polymarket URL:",
      validate: (val) => validateMarketUrl(val).valid || "Enter a valid Polymarket URL."
    },
    {
      type: "input",
      name: "prediction",
      message: "Your prediction (YES/NO):"
    },
    {
      type: "input",
      name: "confidence",
      message: "Confidence (1-100, optional):",
      validate: (val) => {
        if (!val) return true;
        const num = Number(val);
        if (Number.isNaN(num) || num < 1 || num > 100) {
          return "Enter a number between 1 and 100.";
        }
        return true;
      }
    },
    {
      type: "input",
      name: "note",
      message: "Notes (optional):"
    }
  ]);
}

function logCommand() {
  const cmd = new Command("log")
    .description("Log a new prediction")
    .argument("[prediction]", "Prediction outcome (YES/NO)")
    .argument("[url]", "Polymarket event URL")
    .option("--confidence <number>", "Confidence 1-100")
    .option("--note <text>", "Add a note")
    .option("--submit", "Submit to leaderboard API")
    .action(async (predictionArg, urlArg, options) => {
      let prediction = predictionArg;
      let url = urlArg;
      let confidence = options.confidence ? Number(options.confidence) : null;
      let note = options.note || "";

      if (confidence != null) {
        if (Number.isNaN(confidence) || confidence < 1 || confidence > 100) {
          console.error("??? Error: Confidence must be between 1 and 100.");
          process.exit(1);
        }
      }

      if (!prediction || !url) {
        const answers = await promptForInputs();
        prediction = prediction || answers.prediction;
        url = url || answers.url;
        confidence = confidence || (answers.confidence ? Number(answers.confidence) : null);
        note = note || answers.note || "";
      }

      const predictionCheck = validatePrediction(prediction);
      if (!predictionCheck.valid) {
        console.error(`??? Error: ${predictionCheck.error}`);
        process.exit(1);
      }
      prediction = prediction.trim().toUpperCase();

      const urlCheck = validateMarketUrl(url);
      if (!urlCheck.valid) {
        console.error(`??? Error: ${urlCheck.error}`);
        process.exit(1);
      }

      const spinner = ora("Fetching market data...").start();
      try {
        const slug = parseMarketSlug(url);
        if (!slug) {
          spinner.fail("Could not parse market slug.");
          process.exit(1);
        }

        const market = await getMarket(slug);
        const priceTokenId = market.token_id || null;
        const prices = await getPrices(priceTokenId, market.id);
        const normalized = normalizeOdds(prices);
        const outcomeOdds = normalized.allOdds[prediction.toUpperCase()];
        const oddsAtPrediction =
          typeof outcomeOdds === "number" ? outcomeOdds : null;
        if (oddsAtPrediction == null) {
          spinner.fail("Could not determine odds for your prediction.");
          process.exit(1);
        }

        const config = loadConfig();
        ensureDataDirs();

        const id = crypto.randomUUID();
        const createdAt = new Date().toISOString();
        const finalConfidence =
          confidence != null ? confidence : config.default_confidence;
        const shouldSubmit = options.submit || config.auto_submit;

        insertPrediction({
          id,
          market_id: market.id,
          market_slug: slug,
          market_question: market.question || market.title || slug,
          market_url: url,
          predicted_outcome: prediction,
          confidence: finalConfidence,
          odds_at_prediction: oddsAtPrediction,
          status: "pending",
          winning_outcome: null,
          is_correct: null,
          points: null,
          created_at: createdAt,
          resolved_at: null,
          submitted_to_api: 0,
          notes: note
        });

        spinner.succeed("Prediction logged");
        console.log("");
        console.log("???? Prediction logged");
        console.log("");
        console.log(`Market: ${market.question || market.title || slug}`);
        console.log(`Your call: ${prediction}`);
        console.log(`Current odds: ${oddsDisplay(oddsAtPrediction)}`);
        console.log(`Logged: ${formatDate(createdAt)}`);
        if (typeof oddsAtPrediction === "number") {
          console.log(
            `Potential: +${(100 - oddsAtPrediction).toFixed(
              2
            )} / -${oddsAtPrediction.toFixed(2)} pts`
          );
        }
        if (shouldSubmit) {
          console.log("?????? API submission is not available in Phase 1.");
        }
        console.log("");
      } catch (error) {
        spinner.fail("Error logging prediction.");
        console.error(error.message || error);
        process.exit(1);
      }
    });

  return cmd;
}

module.exports = { logCommand };
