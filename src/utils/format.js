const chalk = require("chalk");

function formatDate(iso, format = "local") {
  if (!iso) return "--";
  const date = new Date(iso);
  if (format === "iso") return date.toISOString();
  return date.toLocaleString();
}

function statusBadge(status, isCorrect) {
  if (status === "pending") return chalk.yellow("???");
  if (status === "resolved") {
    if (isCorrect === 1) return chalk.green("???");
    if (isCorrect === 0) return chalk.red("???");
    return chalk.yellow("???");
  }
  return status;
}

function statusLabel(status, isCorrect) {
  if (status === "pending") return "PENDING";
  if (status === "resolved") {
    if (isCorrect === 1) return "CORRECT";
    if (isCorrect === 0) return "INCORRECT";
    return "RESOLVED";
  }
  return String(status || "").toUpperCase();
}

function pointsDisplay(points) {
  if (points == null) return "--";
  if (points > 0) return chalk.green(`+${points}`);
  if (points < 0) return chalk.red(`${points}`);
  return chalk.gray("0");
}

function oddsDisplay(odds) {
  if (odds == null) return "--";
  const num = Number(odds);
  if (Number.isNaN(num)) return "--";
  const isWhole = Number.isInteger(num);
  return `${num.toFixed(isWhole ? 0 : 2)}%`;
}

module.exports = {
  formatDate,
  statusBadge,
  statusLabel,
  pointsDisplay,
  oddsDisplay
};
