import express from "express";
import { getAccountSummaryByNumber } from "../controller/accountSummaryController.js";

const router = express.Router();

router.get("/:accountNumber", getAccountSummaryByNumber);

export default router;
