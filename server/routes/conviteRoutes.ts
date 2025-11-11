import express from "express";
import { verificarTokenConvite } from "../controllers/conviteController";

const router = express.Router();

router.get("/:token", verificarTokenConvite);

export default router;
