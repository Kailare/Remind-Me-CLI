const { Command } = require("commander");
const { listPredictions } = require("../lib/db");
const { pointsDisplay } = require("../utils/format");

function calculateStreaks(predictions) {
  let currentStreak = 0;
  let bestStreak = 0;

  for (const pred of predictions) {
    if (pred.is_correct === 1) {
      currentStreak += 1;
      bestStreak = Math.max(bestStreak, currentStreak);
    } else if (pred.is_correct === 0) {
      currentStreak = 0;
    }
  }

  return { currentStreak, bestStreak };
}

function statsCommand() {
  const cmd = new Command("stats")
    .description("Show your stats")
    .action(() => {
      const predictions = listPredictions();

      const total = predictions.length;
      const correct = predictions.filter((p) => p.is_correct === 1);
      const incorrect = predictions.filter((p) => p.is_correct === 0);
      const pending = predictions.filter((p) => p.status === "pending");

      const points = predictions.reduce((sum, p) => sum + (p.points || 0), 0);
      const accuracy = total ? Math.round((correct.length / total) * 100) : 0;

      const sortedByPoints = [...predictions].sort(
        (a, b) => (b.points || 0) - (a.points || 0)
      );
      const topCall = sortedByPoints.find((p) => p.points > 0);
      const worstCall = [...sortedByPoints].reverse().find((p) => p.points < 0);

      const { currentStreak, bestStreak } = calculateStreaks(
        [...predictions].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      );

      console.log("");
      console.log("???? Your Stats");
      console.log("");
      console.log(`Total predictions: ${total}`);
      console.log(`Correct: ${correct.length} (${accuracy}%)`);
      console.log(`Pending: ${pending.length}`);
      console.log(`Points: ${points}`);
      console.log("");
      console.log(`Current streak: ${currentStreak} ???`);
      console.log(`Best streak: ${bestStreak}`);
      console.log("");
      if (topCall) {
        console.log(
          `Top call: "${topCall.market_question}" ??? ${pointsDisplay(topCall.points)}`
        );
      }
      if (worstCall) {
        console.log(
          `Worst call: "${worstCall.market_question}" ??? ${pointsDisplay(worstCall.points)}`
        );
      }
    });

  return cmd;
}

module.exports = { statsCommand };
