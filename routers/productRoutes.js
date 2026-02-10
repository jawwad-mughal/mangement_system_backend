import express from "express";
import { createProduct, deleteProduct, editProduct, getAllProducts, getSingleProduct } from "../controller/productController.js";
import { upload } from "../middleware/multerMiddleware.js";
import { verifyAccessToken } from "../middleware/verifyAccessToken.js"; // JWT middleware

const router = express.Router();

// ✅ Create product (multiple images)
router.post("/", verifyAccessToken, upload.array("images", 5), createProduct);

// ✅ Get all products
router.get("/", verifyAccessToken, getAllProducts);

// ✅ Get single product
router.get("/:id", verifyAccessToken, getSingleProduct); // new route for single product

// ✅ Update product
router.put("/:id", verifyAccessToken, upload.array("images", 10), editProduct);

// ✅ Delete product
router.delete("/:id", verifyAccessToken, deleteProduct);

export default router;

