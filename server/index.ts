import express, { Application } from "express";
import intencaoRoutes from "./routes/intencaoRoutes";
import conviteRoutes from "./routes/conviteRoutes";
import usuarioRoutes from "./routes/usuariosRoutes";

const app: Application = express();
const port: number = parseInt(process.env.PORT || "3001");

app.use(express.json());

app.use("/api/intencoes", intencaoRoutes);
app.use("/api/convites", conviteRoutes);
app.use("/api/usuarios", usuarioRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
