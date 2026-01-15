import express from "express";
import {
  createStock,
  getAllStock,
  updateStock,
  deleteStock,
} from "../controller/stockController.js";

const router = express.Router();

router.post("/add", createStock);
router.get("/all", getAllStock);

router.put("/update", updateStock);
router.delete("/delete", deleteStock); // id body se jayega

export default router;
