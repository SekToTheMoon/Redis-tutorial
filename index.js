import express from "express";
import ip from "ip";
import dotenv from "dotenv";
import cors from "cors";
import { db, redisConn } from "./db.js";
dotenv.config();
const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

// lazy loding เหมาะสำหรับ โหลดข้อมูลจำนวนมาก ,แคมเปน ,สินค้า, เพื่อไม่ให้client ใช้ db หนักเกินไป
app.get("/redis1", async (req, res) => {
  const cache = await redisConn.get("users");

  if (cache) {
    const jsonCache = JSON.parse(cache);
    return res.json(jsonCache);
  }

  const [results] = await db.query("select * from users");
  res.json(results);
});
const port = process.env.SERVER_PORT;
app.listen(port, () => console.log("----server is start----"));
