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

// Write-through เหมือน lazy loding เปะ เพิ่มแค่ต่อนเขียนข้อมูลลงDatabase
app.get("/redis2", async (req, res) => {
  const cache = await redisConn.get("users");

  if (cache) {
    const jsonCache = JSON.parse(cache);
    return res.json(jsonCache);
  }

  const [results] = await db.query("select * from users");
  res.json(results);
});

app.post("/redis2", async (req, res) => {
  try {
    let user = req.body;
    const [results] = await db.query("insert into users set ?", user);
    user.id = results.insertId;

    let cacheOld = await redisConn.get("users");
    let newData = [];

    if (cacheOld) {
      const cacheOldJson = JSON.parse(cacheOld);
      console.log("cacheOldJson", cacheOldJson);

      newData = cacheOldJson.concat(user);
      console.log("newData", newData);
      await redisConn.set("users", JSON.stringify(newData));
    } else {
      const [result] = await db.query("select * from users");
      await redisConn.set("users", JSON.stringify(result));
    }
    res.json({ message: "insert success", dataAdded: user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred" });
  }
});

// test
const port = process.env.SERVER_PORT;
app.listen(port, () => console.log("----server is start----"));
