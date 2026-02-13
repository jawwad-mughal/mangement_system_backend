import bcrypt from "bcryptjs";
import { addEmployees } from "../model/addEmployeeSchema.js";
import { addBranch } from "../model/branchSchema.js";
import cloudinary from "../services/cloudinaryConfig.js";
import streamifier from "streamifier";

// ------------------ Helper: Upload to Cloudinary ------------------
const uploadToCloudinary = (fileBuffer, folder = "employees") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
      if (result) resolve(result);
      else reject(error);
    });
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

// ===============================
// ✅ CREATE EMPLOYEE
// ===============================
export const createEmployee = async (req, res) => {
  try {
    const { employeeName, email, password, position, phone, salary, branchCode, access } = req.body;

    const exists = await addEmployees.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already exists" });

    const branchId = await addBranch.findOne({ branchCode });

    if (!req.file) return res.status(400).json({ message: "Image required" });

    // Upload image to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, "employees");

    const employee = await addEmployees.create({
      employeeName,
      email,
      password,
      position,
      phone,
      salary,
      branchName: branchId ? branchId.branchName : "adminbranch",
      branchrefernce: branchId ? branchId._id : null,
      access: JSON.parse(access), // frontend sends JSON string
      image: result.secure_url,
      image_public_id: result.public_id,
    });

    res.status(201).json({
      success: true,
      message: "Employee created successfully",
      employee,
    });
  } catch (error) {
    console.error("CREATE EMPLOYEE ERROR:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ===============================
// ✅ GET ALL EMPLOYEES (with pagination)
// ===============================
export const getAllEmployees = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // SaaS / Branch filter
    const filter = {};
    if (req.user?.branchrefernce) {
      filter.branchrefernce = req.user.branchrefernce;
    }

    const employees = await addEmployees
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await addEmployees.countDocuments(filter);

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
    console.error("GET EMPLOYEES ERROR:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ===============================
// ✅ GET SINGLE EMPLOYEE
// ===============================
export const getSingleData = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await addEmployees.findById(id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    res.status(200).json(employee);
  } catch (error) {
    console.error("GET SINGLE EMPLOYEE ERROR:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ===============================
// ✅ UPDATE EMPLOYEE
// ===============================
export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeName, email, position, phone, salary, branchCode, access, password } = req.body;

    const employee = await addEmployees.findById(id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    // Safe branch handling
    let branch = await addBranch.findOne({ branchCode });
    if (!branch) branch = { branchName: "adminbranch", _id: null };

    // Handle new image upload
    let updatedData = {
      employeeName,
      email,
      position,
      phone,
      salary,
      branchName: branch.branchName,
      branchrefernce: branch._id,
    };

    // Update access safely
    if (access) {
      try {
        updatedData.access = typeof access === "string" ? JSON.parse(access) : access;
      } catch {
        updatedData.access = employee.access;
      }
    } else {
      updatedData.access = employee.access;
    }

    // Update password if provided
    if (password) updatedData.password = password;

    // If new image is uploaded
    if (req.file) {
      // Delete old image from Cloudinary
      if (employee.image_public_id) {
        await cloudinary.uploader.destroy(employee.image_public_id);
      }

      const result = await uploadToCloudinary(req.file.buffer, "employees");
      updatedData.image = result.secure_url;
      updatedData.image_public_id = result.public_id;
    }

    const updatedEmployee = await addEmployees.findByIdAndUpdate(id, updatedData, { new: true });

    res.status(200).json({ success: true, message: "Employee updated successfully", employee: updatedEmployee });
  } catch (err) {
    console.error("UPDATE EMPLOYEE ERROR:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ===============================
// ✅ DELETE EMPLOYEE
// ===============================
export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await addEmployees.findById(id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    // Delete image from Cloudinary
    if (employee.image_public_id) {
      await cloudinary.uploader.destroy(employee.image_public_id);
    }

    await addEmployees.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Employee deleted successfully" });
  } catch (err) {
    console.error("DELETE EMPLOYEE ERROR:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

