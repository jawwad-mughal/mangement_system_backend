import express from "express";
import { createProduct, deleteProduct, editProduct, getAllProducts } from "../controller/productController.js";
import { upload } from "../middleware/multerMiddleware.js"

const router = express.Router();

// Route: Create product with multiple images
// 'images' is the form field name
router.post("/create", upload.array("images", 5), createProduct);

// Get all products (JWT auth + branch filter)
router.get("/", getAllProducts);

router.put(
  "/update/:id",
  upload.array("images", 10),
  editProduct
);

router.delete("/delete/:id", deleteProduct)

export default router;
