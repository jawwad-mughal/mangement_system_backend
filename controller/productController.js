// controllers/productController.js
import Product from "../model/product.js";
import cloudinary from "../services/cloudinaryConfig.js";
import { addEmployees } from "../model/addEmployeeSchema.js";
import jwt from "jsonwebtoken";
import streamifier from "streamifier";

// ------------------ Helper: Upload to Cloudinary ------------------
const uploadToCloudinary = (fileBuffer, folder = "products") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
      if (result) resolve(result);
      else reject(error);
    });
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

// ---------------- CREATE PRODUCT ----------------
export const createProduct = async (req, res) => {
  try {
    const accessToken = req.cookies.refreshToken || req.headers["authorization"]?.split(" ")[1];
    if (!accessToken) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(accessToken, process.env.JWT_REFRESH_SECRET);
    const email = decoded.email || decoded.role;

    const employee = await addEmployees.findOne({ email });
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    const branchRef = employee.branchrefernce;
    const { name, title, description, category, price, stock } = req.body;

    if (!name || !title || !description || !category || !price || !stock)
      return res.status(400).json({ message: "All fields are required" });

    const isProduct = await Product.findOne({ name });
    if (isProduct) return res.status(409).json({ message: "Product Already Exist" });

    // Upload images
    const images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer, "products");
        images.push({ url: result.secure_url, public_id: result.public_id });
      }
    }

    if (images.length === 0) return res.status(400).json({ message: "At least one image is required" });

    const product = new Product({ name, title, description, category, price, stock, images, branchRef });
    await product.save();

    res.status(201).json({ message: "Product created successfully", product });
  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ---------------- GET ALL PRODUCTS ----------------
export const getAllProducts = async (req, res) => {
  try {
    const accessToken = req.cookies.refreshToken || req.headers["authorization"]?.split(" ")[1];
    if (!accessToken) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(accessToken, process.env.JWT_REFRESH_SECRET);
    const email = decoded.email || decoded.role;

    const employee = await addEmployees.findOne({ email });
    const branchRef = employee?.branchrefernce;

    const products = branchRef
      ? await Product.find({ branchRef }).sort({ createdAt: -1 })
      : await Product.find().sort({ createdAt: -1 });

    res.status(200).json(products);
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ---------------- EDIT PRODUCT ----------------
export const editProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const { name, title, description, category, price, stock, images } = req.body;

    // Update fields
    product.name = name ?? product.name;
    product.title = title ?? product.title;
    product.description = description ?? product.description;
    product.category = category ?? product.category;
    product.price = price ?? product.price;
    product.stock = stock ?? product.stock;

    // Remove deleted images
    if (images) {
      const removedImages = product.images.filter(img => !images.includes(img.url));
      for (const img of removedImages) {
        await cloudinary.uploader.destroy(img.public_id);
      }
      product.images = product.images.filter(img => images.includes(img.url));
    }

    // Upload new images
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer, "products");
        product.images.push({ url: result.secure_url, public_id: result.public_id });
      }
    }

    await product.save();
    res.status(200).json({ message: "Product updated successfully", product });
  } catch (error) {
    console.error("EDIT PRODUCT ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ---------------- DELETE PRODUCT ----------------
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      for (const img of product.images) {
        await cloudinary.uploader.destroy(img.public_id);
      }
    }

    await product.deleteOne();
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


