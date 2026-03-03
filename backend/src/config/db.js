const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
const dbName = process.env.MONGODB_DB || "shophub";

let client;
let clientPromise;

async function getDb() {
  if (!clientPromise) {
    client = new MongoClient(uri, { maxPoolSize: 10 });
    clientPromise = client.connect();
  }
  const connectedClient = await clientPromise;
  return connectedClient.db(dbName);
}

module.exports = { getDb };
