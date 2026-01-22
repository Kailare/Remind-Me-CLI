const axios = require("axios");

function parseMarketSlug(url) {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("polymarket.com")) {
      return null;
    }
    const parts = parsed.pathname.split("/").filter(Boolean);
    const eventIndex = parts.indexOf("event");
    if (eventIndex === -1 || !parts[eventIndex + 1]) return null;
    return parts[eventIndex + 1];
  } catch (error) {
    return null;
  }
}

async function getMarket(slug) {
  const res = await axios.get(`https://clob.polymarket.com/markets/${slug}`);
  return res.data;
}

async function getPrices(tokenId, marketId) {
  const queryParam = tokenId
    ? `token_id=${tokenId}`
    : `market_id=${marketId}`;
  if (!tokenId && !marketId) {
    throw new Error("Missing market identifier for price lookup.");
  }
  const res = await axios.get(
    `https://clob.polymarket.com/prices?${queryParam}`
  );
  return res.data;
}

function normalizeOdds(prices) {
  if (!prices) return { odds: null, allOdds: {} };

  if (prices.prices) {
    const odds = {};
    for (const item of prices.prices) {
      if (item.outcome && typeof item.price === "number") {
        odds[item.outcome.toUpperCase()] = Number((item.price * 100).toFixed(2));
      }
    }
    return { odds: null, allOdds: odds };
  }

  if (prices.yes_price != null && prices.no_price != null) {
    return {
      odds: {
        YES: Number((prices.yes_price * 100).toFixed(2)),
        NO: Number((prices.no_price * 100).toFixed(2))
      },
      allOdds: {
        YES: Number((prices.yes_price * 100).toFixed(2)),
        NO: Number((prices.no_price * 100).toFixed(2))
      }
    };
  }

  return { odds: null, allOdds: {} };
}

module.exports = {
  parseMarketSlug,
  getMarket,
  getPrices,
  normalizeOdds
};
