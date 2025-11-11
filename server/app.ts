// server/app.ts
import express, { Application } from "express";
import dotenv from "dotenv";

import intencaoRoutes from "./routes/intencaoRoutes";
import conviteRoutes from "./routes/conviteRoutes";
import usuarioRoutes from "./routes/usuariosRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";

dotenv.config();

const app: Application = express();

app.use(express.json());

app.use("/api/intencoes", intencaoRoutes);
app.use("/api/convites", conviteRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/dashboard", dashboardRoutes);

export default app;
