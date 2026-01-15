import bcrypt from "bcryptjs";
import { addEmployees } from "../model/addEmployeeSchema.js";
import fs from "fs/promises";
import path from "path";
import { addBranch } from "../model/branchSchema.js";

// ===============================
// ✅ Create Employee
// ===============================

export const createEmployee = async (req, res) => {
  
  try {
    const {
      employeeName,
      email,
      password,
      position,
      phone,
      salary,
      branchCode,
      access,
    } = req.body;

    const exists = await addEmployees.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "Email already exists" });

    const branchId = await addBranch.findOne({ branchCode });
    
    const imagePath = req.file ? req.file.filename : null;
    if (!imagePath) return res.status(400).json({ messge: "Image requried " });

    const employee = await addEmployees.create({
      employeeName,
      email,
      password,
      position,
      phone,
      salary,
      branchName: branchId ? branchId.branchName : "adminbranch",
      branchrefernce: branchId ? branchId._id : null,
      access: JSON.parse(access), // because frontend sends JSON string
      image: imagePath,
    });

    res.status(201).json({
      success: true,
      message: "Employee created successfully",
      employee,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ===============================
// ✅ Get All Employees
// ===============================
export const getAllEmployees = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page
    const limit = parseInt(req.query.limit) || 20; // Items per page
    const skip = (page - 1) * limit;

    // Get paginated employees
    const employees = await addEmployees
      .find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await addEmployees.countDocuments();

    res.status(200).json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
      employees,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// get single add
export const getSingleData = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await addEmployees.findById(id);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    return res.status(200).json(employee);
  } catch (error) {
    console.error("Error fetching employee:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Update Employee
export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      employeeName,
      email,
      position,
      phone,
      salary,
      branchCode,
      access,
      password,
    } = req.body;

    const employee = await addEmployees.findById(id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    // Safe branch handling
    let branch = await addBranch.findOne({ branchCode });
    if (!branch) branch = { branchName: "adminbranch", _id: null };

    // Delete old image if new uploaded
    if (req.file && employee.image) {
      const oldPath = path.join("uploads", employee.image);
      try { 
        await fs.unlink(oldPath); 
      } catch {

      }
    }

    // Safe access parsing
    let parsedAccess = employee.access;
    if (access) {
      try { parsedAccess = typeof access === "string" ? JSON.parse(access) : access; }
      catch { parsedAccess = employee.access; }
    }

    // Prepare updated data
    const updatedData = {
      employeeName,
      email,
      position,
      phone,
      salary,
      branchName: branch.branchName,
      branchrefernce: branch._id,
      access: parsedAccess,
    };

    if (password) updatedData.password = password;
    if (req.file) updatedData.image = req.file.filename;

    const updatedEmployee = await addEmployees.findByIdAndUpdate(
      id,
      updatedData,
      { new: true }
    );

    return res.status(200).json({ success: "Branch updated successfully", employee: updatedEmployee });
  } catch (err) {
    console.error("Update Employee Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};


// ✅ Delete Employee
export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await addEmployees.findById(id);
    if (!employee)
      return res.status(404).json({ message: "Employee not found" });

    // DELETE IMAGE IF EXISTS
    if (employee.image) {
      const filePath = path.join("uploads", employee.image);
      try {
        await fs.unlink(filePath);
        
      } catch (err) {
        // ignore if file doesn't exist
      }
    }

    await addEmployees.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Employee deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};
