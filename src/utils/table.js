const Table = require("cli-table3");

function createTable(head) {
  return new Table({
    head,
    style: { head: [], border: [] },
    colAligns: ["left", "left", "left", "left", "left", "left"]
  });
}

module.exports = {
  createTable
};
