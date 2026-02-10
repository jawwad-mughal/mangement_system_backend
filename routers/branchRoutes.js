import express from "express";
import {
  createBranch,
  deleteBranch,
  fetchBranch,
  getAllBranch,
  getSingle,
  updateBranch,
} from "../controller/branchController.js";
import { upload } from "../middleware/multerMiddleware.js";

const router = express.Router();

// ---------------- CREATE BRANCH ----------------
router.post("/createbranch", upload.single("branchImage"), createBranch);

// ---------------- GET BRANCHES WITH PAGINATION ----------------
router.get("/get", fetchBranch);

// ---------------- GET ALL BRANCHES (no pagination) ----------------
router.get("/getallbranch", getAllBranch);

// ---------------- GET SINGLE BRANCH ----------------
router.get("/getsinglebranch/:id", getSingle);

// ---------------- UPDATE BRANCH ----------------
router.put("/updatebranch", upload.single("branchImage"), updateBranch);

// ---------------- DELETE BRANCH ----------------
router.delete("/delete/:id", deleteBranch);

export default router;
