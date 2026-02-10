import express from 'express';
import {
  createEmployee,
  deleteEmployee,
  getAllEmployees,
  getSingleData,
  updateEmployee
} from '../controller/addEmployeeController.js';
import { upload } from "../middleware/multerMiddleware.js";
// import { verifyAccessToken } from "../middleware/verifyAccessToken.js";

const router = express.Router();

// Add Employee (single image)
router.post("/add", upload.single("image"), /*verifyAccessToken,*/ createEmployee);

// Get all Employees
router.get("/", /*verifyAccessToken,*/ getAllEmployees);

// Get single Employee
router.get("/:id", /*verifyAccessToken,*/ getSingleData);

// Update Employee
router.put("/update/:id", upload.single("image"), /*verifyAccessToken,*/ updateEmployee);

// Delete Employee
router.delete("/delete/:id", /*verifyAccessToken,*/ deleteEmployee);

export default router;
