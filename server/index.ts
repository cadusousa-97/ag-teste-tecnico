// server/index.ts
import express, { Request, Response, Application } from "express";
import db from "./db";
import intencaoRoutes from "./routes/intencaoRoutes";
//import conviteRoutes from "./routes/conviteRoutes";
//import usuarioRoutes from "./routes/usuarioRoutes";

const app: Application = express();
const port: number = parseInt(process.env.PORT || "3001");

app.use(express.json());

app.use("/api/intencoes", intencaoRoutes);
//app.use("/api/convites", conviteRoutes);
//app.use("/api/usuarios", usuarioRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
