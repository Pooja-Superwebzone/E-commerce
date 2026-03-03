let redisClient = null;
let isRedisReady = false;
const CACHE_ENABLED = String(process.env.CACHE_ENABLED || "true").toLowerCase() !== "false";

function safeJsonParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

async function createRedisClient() {
  if (!CACHE_ENABLED) return null;

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) return null;

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

  client.on("error", () => {
    isRedisReady = false;
  });
  client.on("ready", () => {
    isRedisReady = true;
  });
  client.on("end", () => {
    isRedisReady = false;
  });

  await client.connect();
  return client;
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

module.exports = {
  getCache,
  setCache,
  delCache,
};
