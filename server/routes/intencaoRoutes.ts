import express from "express";

import {
  criarIntencao,
  listarIntencoes,
  atualizarStatusIntencao,
} from "../controllers/intencaoController";

const router = express.Router();

router.post("/", criarIntencao);
router.get("/", listarIntencoes);
router.patch("/:id", atualizarStatusIntencao);

export default router;
