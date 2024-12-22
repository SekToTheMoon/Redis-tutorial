import mysql2 from "mysql2/promise";
import redis from "redis";

async function initConnections() {
  // MySQL Connection
  const db = await mysql2.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "avalon",
  });

  // Redis Connection
  const redisConn = redis.createClient();
  redisConn.on("error", (err) => console.error("Redis Client Error", err));
  await redisConn.connect();

  return { db, redisConn };
}

// Initialize and export the connections
const { db, redisConn } = await initConnections();

export { db, redisConn };
