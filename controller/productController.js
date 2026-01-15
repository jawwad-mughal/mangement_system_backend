// controllers/productController.js
import Product from "../model/product.js";
import path from "path";
import fs from "fs";
import cloudinary from "../services/cloudinaryConfig.js";
import { addEmployees } from "../model/addEmployeeSchema.js";
import jwt from "jsonwebtoken";

export const createProduct = async (req, res) => {
  try {
    
    const accessToken =
      req.cookies.refreshToken || req.headers["authorization"]?.split(" ")[1];

    if (!accessToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(accessToken, process.env.JWT_REFRESH_SECRET);
    const email = decoded.role;

    const employee = await addEmployees.findOne({ email });
    const branchRef = employee?.branchrefernce;

    const { name, title, description, category, price, stock } = req.body;

    const isproduct = await Product.findOne({ name });
    if (isproduct) return res.json({ message: "Product Already Exist" });

    let images = [];

    // Multiple images Cloudinary upload
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "products",
        });

        images.push({
          url: result.secure_url, // Cloudinary URL
          public_id: result.public_id, // future delete/update ke liye
        });

        fs.unlinkSync(file.path); // local file delete
      }
    }

    const product = new Product({
      name,
      title,
      description,
      category,
      price,
      stock,
      images,
      branchRef,
    });

    await product.save();

    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const accessToken =
      req.cookies.refreshToken || req.headers["authorization"]?.split(" ")[1];

    if (!accessToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(accessToken, process.env.JWT_REFRESH_SECRET);
    const email = decoded.role;

    const employee = await addEmployees.findOne({ email });
    const branchRef = employee?.branchrefernce;

    let products    
    if(branchRef){
      products = await Product.find({branchRef}).sort({ createdAt: -1 });
    }else{
      products = await Product.find().sort({ createdAt: -1 });
    }

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const editProduct = async (req, res) => {
  try {
    // ---------------- AUTH ----------------
    // const accessToken =
    //   req.cookies.refreshToken || req.headers["authorization"]?.split(" ")[1];

    // if (!accessToken) {
    //   return res.status(401).json({ message: "Unauthorized" });
    // }

    // const decoded = jwt.verify(accessToken, process.env.JWT_REFRESH_SECRET);
    // const email = decoded.role;

    // const employee = await addEmployees.findOne({ email }) || "admin";
    // if (!employee) {
    //   return res.status(404).json({ message: "Employee not found" });
    // }

    // const branchRef = employee.branchrefernce;

    // ---------------- PRODUCT ----------------
    const { id } = req.params;
    console.log(id)
    const product = await Product.findOne({ _id: id });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // ---------------- UPDATE FIELDS ----------------
    const { name, title, description, category, price, stock, images } = req.body;

    product.name = name ?? product.name;
    product.title = title ?? product.title;
    product.description = description ?? product.description;
    product.category = category ?? product.category;
    product.price = price ?? product.price;
    product.stock = stock ?? product.stock;

    // ---------------- IMAGE HANDLING ----------------
    /**
     * Frontend se images array URLs ki form me aa rahi hain
     * New images → req.files
     */

    // 1️⃣ Remove deleted images (Cloudinary)
    if (images) {
      const removedImages = product.images.filter(
        (img) => !images.includes(img.url)
      );

      for (const img of removedImages) {
        await cloudinary.uploader.destroy(img.public_id);
      }

      product.images = product.images.filter((img) =>
        images.includes(img.url)
      );
    }

    // 2️⃣ Upload new images
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "products",
        });

        product.images.push({
          url: result.secure_url,
          public_id: result.public_id,
        });

        fs.unlinkSync(file.path);
      }
    }

    await product.save();

    res.status(200).json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("EDIT PRODUCT ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    // ---------------- AUTH ----------------
    // const accessToken =
    //   req.cookies.refreshToken || req.headers["authorization"]?.split(" ")[1];

    // if (!accessToken) {
    //   return res.status(401).json({ message: "Unauthorized" });
    // }

    // const decoded = jwt.verify(accessToken, process.env.JWT_REFRESH_SECRET);
    // const email = decoded.role;

    // const employee = await addEmployees.findOne({ email });
    // if (!employee) {
    //   return res.status(404).json({ message: "Employee not found" });
    // }

    // const branchRef = employee.branchrefernce;

    // ---------------- PRODUCT ----------------
    const { id } = req.params;
    const product = await Product.findOne({ _id: id});

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // ---------------- DELETE IMAGES ----------------
    if (product.images && product.images.length > 0) {
      for (const img of product.images) {
        await cloudinary.uploader.destroy(img.public_id);
      }
    }

    // ---------------- DELETE PRODUCT ----------------
    await product.deleteOne();

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

