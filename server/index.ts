import app from "./app";

const port: number = parseInt(process.env.PORT || "3001");

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
