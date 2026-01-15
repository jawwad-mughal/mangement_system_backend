import { addEmployees } from "../model/addEmployeeSchema.js";
import { addStock } from "../model/addStockSchema.js";
import jwt from "jsonwebtoken";

// ADD NEW STOCK
export const createStock = async (req, res) => {
  try {
    const accessToken = req.cookies.refreshToken || req.headers["authorization"]?.split(" ")[1];

    if (!accessToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(accessToken, process.env.JWT_REFRESH_SECRET);
        const email = decoded.role;
    
        const employee = await addEmployees.findOne({ email });
        const branchRef = employee?.branchrefernce;
    console.log(branchRef)

    const { productname, qty, unit, supplier, date, category } = req.body;

    if (!productname || !qty || !unit || !supplier || !date || !category) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newStock = await addStock.create({
      productname,
      qty,
      unit,
      supplier,
      date,
      category,
    });

    return res.status(201).json({
      message: "Stock added successfully",
      data: newStock,
    });
  } catch (error) {
    console.log("Create Stock Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

// GET ALL STOCK
export const getAllStock = async (req, res) => {
 
  try {
    const accessToken = req.cookies.refreshToken || req.headers["authorization"]?.split(" ")[1];

    if (!accessToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(accessToken, process.env.JWT_REFRESH_SECRET);
        const email = decoded.role;
    
        const employee = await addEmployees.findOne({ email });
        const branchRef = employee?.branchrefernce;

    let stocks;
    if(branchRef) {
      stocks = await addStock.find().populate({
        path: "category",
        match: { branchRef },
      });
      stocks = stocks.filter((item) => item.category !== null);
      
      
    }else {
      stocks = await addStock.find().populate("category");
    }
    
    return res.status(200).json({ data: stocks });
  } catch (error) {
    console.log("Get All Stock Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

// UPDATE STOCK
export const updateStock = async (req, res) => {
  // console.log(req.body)
  try {
    const { id } = req.body

    const update = await addStock.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!update) {
      return res.status(404).json({ message: "Stock not found" });
    }

    return res.status(200).json({
      message: "Stock updated successfully",
      data: update,
    });
  } catch (error) {
    console.log("Update Stock Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

// DELETE STOCK
export const deleteStock = async (req, res) => {
  try {
    const { id } = req.body;

    const deleted = await addStock.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Stock not found" });
    }

    return res.status(200).json({ message: "Stock deleted successfully" });
  } catch (error) {
    console.log("Delete Stock Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};
