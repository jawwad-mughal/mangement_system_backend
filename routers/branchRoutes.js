import express from "express";
import {
  createBranch,
  deleteBranch,
  getAllBranch,
  getSingleBranch,
  updateBranch,
} from "../controller/branchController.js";
import { upload } from "../middleware/multerMiddleware.js";

const router = express.Router();

// ---------------- CREATE BRANCH ----------------
router.post("/createbranch", upload.single("branchImage"), createBranch);

// ---------------- GET BRANCHES WITH PAGINATION ----------------

// ---------------- GET ALL BRANCHES (no pagination) ----------------
router.get("/getallbranch", getAllBranch);

// ---------------- GET SINGLE BRANCH ----------------
router.get("/getsinglebranch/:id", getSingleBranch);

// ---------------- UPDATE BRANCH ----------------
router.put("/updatebranch", upload.single("branchImage"), updateBranch);

// ---------------- DELETE BRANCH ----------------
router.delete("/delete/:id", deleteBranch);

export default router;
