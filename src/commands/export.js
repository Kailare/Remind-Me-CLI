const { Command } = require("commander");
const fs = require("fs");
const path = require("path");
const { listPredictions } = require("../lib/db");
const { statusLabel, oddsDisplay } = require("../utils/format");

function toCsvValue(value) {
  if (value == null) return "";
  const str = String(value);
  if (str.includes('"') || str.includes(",") || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function buildCsv(predictions) {
  const headers = [
    "id",
    "market_id",
    "market_slug",
    "market_question",
    "market_url",
    "predicted_outcome",
    "confidence",
    "odds_at_prediction",
    "status",
    "is_correct",
    "points",
    "created_at",
    "resolved_at",
    "submitted_to_api",
    "notes"
  ];
  const lines = [headers.join(",")];
  for (const pred of predictions) {
    const row = headers.map((key) => toCsvValue(pred[key]));
    lines.push(row.join(","));
  }
  return lines.join("\n");
}

function buildMarkdown(predictions) {
  const headers = ["ID", "Market", "Call", "Odds", "Status", "Points"];
  const lines = [];
  lines.push(`| ${headers.join(" | ")} |`);
  lines.push(`| ${headers.map(() => "---").join(" | ")} |`);
  for (const pred of predictions) {
    lines.push(
      `| ${pred.id} | ${pred.market_question} | ${pred.predicted_outcome} | ${oddsDisplay(
        pred.odds_at_prediction
      )} | ${statusLabel(pred.status, pred.is_correct)} | ${plainPoints(
        pred.points
      )} |`
    );
  }
  return lines.join("\n");
}

function plainPoints(points) {
  if (points == null) return "--";
  if (points > 0) return `+${points}`;
  return String(points);
}

function exportCommand() {
  const cmd = new Command("export")
    .description("Export predictions")
    .option("--format <format>", "Output format (json|csv|md)", "json")
    .option("--output <file>", "Output file")
    .action((options) => {
      const format = String(options.format || "json").toLowerCase();
      const predictions = listPredictions();

      let output = "";
      if (format === "json") {
        output = JSON.stringify(predictions, null, 2);
      } else if (format === "csv") {
        output = buildCsv(predictions);
      } else if (format === "md") {
        output = buildMarkdown(predictions);
      } else {
        console.error("??? Unsupported format. Use json, csv, or md.");
        process.exit(1);
      }

      if (options.output) {
        const outputPath = path.resolve(options.output);
        fs.writeFileSync(outputPath, output);
        console.log(`??? Exported to ${outputPath}`);
        return;
      }

      console.log(output);
    });

  return cmd;
}

module.exports = { exportCommand };
