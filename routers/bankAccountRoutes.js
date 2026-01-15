import express from "express";
import { createBankAccount } from "../controller/bankAccountController.js";

const router = express.Router();

router.post("/create", createBankAccount);

export default router;
