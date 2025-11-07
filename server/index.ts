// server/index.ts
import express, { Request, Response, Application } from "express";
import db from "./db";

const app: Application = express();
const port: number = parseInt(process.env.PORT || "3001");

app.use(express.json());

app.get("/api", (req: Request, res: Response) => {
  res.send("Hello world!");
});

app.get("/api/db-test", async (req: Request, res: Response) => {
  try {
    const { rows } = await db.query("SELECT NOW()", []);
    res.json({ time: rows[0].now });
  } catch (err) {
    console.error("DB connection failed:", err);
    res.status(500).send("Internal server error");
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
