let redisClient = null;
let isRedisReady = false;
const CACHE_ENABLED =
  String(process.env.CACHE_ENABLED || "true").toLowerCase() !== "false";

function safeJsonParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function getRedisUrl() {
  return String(process.env.REDIS_URL || "").trim();
}

function isValidRedisUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "redis:" || parsed.protocol === "rediss:";
  } catch {
    return false;
  }
}

async function createRedisClient() {
  if (!CACHE_ENABLED) return null;

  const redisUrl = getRedisUrl();
  if (!redisUrl) return null;

  if (!isValidRedisUrl(redisUrl)) return null;

  let redisPackage;
  try {
    redisPackage = require("redis");
  } catch {
    return null;
  }

  const client = redisPackage.createClient({
    url: redisUrl,
    socket: {
      reconnectStrategy: (retries) => Math.min(retries * 100, 2000),
    },
  });

  client.on("ready", () => {
    isRedisReady = true;
  });

  client.on("error", () => {
    isRedisReady = false;
  });

  client.on("end", () => {
    isRedisReady = false;
  });

  try {
    await client.connect();
    return client;
  } catch {
    isRedisReady = false;
    return null;
  }
}

async function getClient() {
  if (redisClient) return redisClient;
  try {
    redisClient = await createRedisClient();
    return redisClient;
  } catch {
    redisClient = null;
    return null;
  }
}

async function initCache() {
  const client = await getClient();
  const active = CACHE_ENABLED && Boolean(client) && isRedisReady;
  console.log(active ? "[cache] Redis connected" : "[cache] Redis not connected");
  return active;
}

async function getCache(key) {
  const client = await getClient();
  if (!client || !isRedisReady) return null;

  try {
    const value = await client.get(key);
    if (!value) return null;
    return safeJsonParse(value);
  } catch {
    return null;
  }
}

async function setCache(key, data, ttlSeconds) {
  const client = await getClient();
  if (!client || !isRedisReady) return false;

  try {
    await client.set(key, JSON.stringify(data), { EX: ttlSeconds });
    return true;
  } catch {
    return false;
  }
}

async function delCache(key) {
  const client = await getClient();
  if (!client || !isRedisReady) return false;

  try {
    await client.del(key);
    return true;
  } catch {
    return false;
  }
}

async function delCacheByPrefix(prefix) {
  const client = await getClient();
  if (!client || !isRedisReady) return false;

  try {
    const keys = await client.keys(`${prefix}*`);
    if (!Array.isArray(keys) || keys.length === 0) return true;
    await client.del(keys);
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  initCache,
  getCache,
  setCache,
  delCache,
  delCacheByPrefix,
};
