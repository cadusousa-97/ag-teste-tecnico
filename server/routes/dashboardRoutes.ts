import express from "express";
import { listarDashboardStats } from "../controllers/dashboardController";

const router = express.Router();

router.get("/stats", listarDashboardStats);

export default router;
