const fs = require("fs");
const path = require("path");
const os = require("os");

const DATA_DIR = path.join(os.homedir(), ".remindme");

const DEFAULT_CONFIG = {
  wallet_address: null,
  api_enabled: false,
  api_url: "https://api.remindme.gg",
  auto_submit: false,
  notifications: true,
  default_confidence: null
};

function getConfigPath() {
  return path.join(DATA_DIR, "config.json");
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function ensureDataDirs() {
  ensureDir(DATA_DIR);
  return { dataDir: DATA_DIR };
}

function loadConfig() {
  const configPath = getConfigPath();
  if (!fs.existsSync(configPath)) {
    return { ...DEFAULT_CONFIG };
  }
  const raw = fs.readFileSync(configPath, "utf8");
  const parsed = JSON.parse(raw);
  return { ...DEFAULT_CONFIG, ...parsed };
}

function saveConfig(config) {
  const configPath = getConfigPath();
  ensureDir(path.dirname(configPath));
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

function getDataPaths() {
  return {
    dataDir: DATA_DIR,
    dbPath: path.join(DATA_DIR, "remindme.db")
  };
}

module.exports = {
  DATA_DIR,
  DEFAULT_CONFIG,
  getConfigPath,
  ensureDataDirs,
  loadConfig,
  saveConfig,
  getDataPaths
};
