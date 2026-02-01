
import express from "express";
import {
  createBankAccount,
  getBankAccounts,
  editBankAccount,
  deleteBankAccount
} from "../controller/bankAccountController.js";

const router = express.Router();

router.post("/create", createBankAccount);
router.get("/getall", getBankAccounts);
router.put("/edit", editBankAccount);
router.delete("/delete", deleteBankAccount);

export default router;




