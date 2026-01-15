import fs from "fs/promises";
import path from "path";
import { addBranch } from "../model/branchSchema.js";
import jwt from "jsonwebtoken";
// create new branch in databse
export const createBranch = async (req, res) => {
  try {
    const accessToken = req.cookies.refreshToken || req.headers["authorization"]?.split(" ")[1];
      
      if (!accessToken) {
        return res.status(401).json({ message: "Unauthorized" });
      }

    const decoded = jwt.verify(
            accessToken,
            process.env.JWT_REFRESH_SECRET
          );

    let adminId

    if(decoded?.name === "admin") {
          adminId = decoded.id
    }

    if(!adminId)  return res.status(401).json({ message: "Create Branch Only Admin" });

    const {
      branchName,
      managerName,
      phone,
      city,
      email,
      address,
      active,
      branchCode,
    } = req.body;

    if (
      !branchName ||
      !managerName ||
      !phone ||
      !email ||
      !address ||
      !active ||
      !city ||
      !branchCode
    ) {
      return res.status(400).json({ message: "All Fields are Required" });
    }

    const existingBranch = await addBranch.findOne({ branchCode });
    // console.log(existingBranch)
      if (existingBranch) {
        return res.status(409).json({ message: "Branch already exists" });
      }

    // Multer file
    const branchImage = req.file ? req.file.filename : null;
      if (!branchImage) return res.status(400).json({ messge: "Image requried " });


    const branch = await addBranch.create({
      branchImage,
      branchName,
      branchCode,
      managerName,
      phone,
      email,
      city,
      address,
      active,
      adminRef: adminId 
    });

    return res
      .status(200)
      .json({ branch, message: "Branch Successfully Created" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// get all branch in pagination
export const fetchBranch = async (req, res) => {
  try {
     const accessToken = req.cookies.refreshToken || req.headers["authorization"]?.split(" ")[1];
      
      if (!accessToken) {
        return res.status(401).json({ message: "Unauthorized" });
      }

    const decoded = jwt.verify(
            accessToken,
            process.env.JWT_REFRESH_SECRET
          );

    let adminId

    if(decoded?.name === "admin") {
          adminId = decoded.id
    }
    

    const page = req.query.page || 1;
    const limit = req.query.limit || 20;
    const skip = (page - 1) * limit;

    const getAllBranch = await addBranch
      .find({adminRef: adminId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalDoc = await addBranch.countDocuments();

    res.status(201).json({
      totalPages: Math.ceil(totalDoc / limit),
      hasMore: page * limit < totalDoc,
      getAllBranch,
    });
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

// get single data

export const getSingle = async (req, res) => {
  try {

    const {id} = req.params;
    const branch = await addBranch.findById(id);
    if(!branch) return res.status(404).json({message: "Branch not found"});

    res.status(201).json(branch)
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
}

// UPDATE BRANCH
export const updateBranch = async (req, res) => {
  try {
    // ---------------- AUTH ----------------
    const accessToken = req.cookies.refreshToken || req.headers["authorization"]?.split(" ")[1];
    if (!accessToken) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(accessToken, process.env.JWT_REFRESH_SECRET);
    if (decoded?.name !== "admin")
      return res.status(401).json({ message: "Update Branch Only Admin" });

    const adminId = decoded.id;

    // ---------------- VALIDATION ----------------
    const {
      branchId,
      branchName,
      managerName,
      phone,
      city,
      email,
      address,
      active,
      branchCode,
    } = req.body;

    if (!branchId) return res.status(400).json({ message: "Branch ID required" });

    const branch = await addBranch.findById(branchId);
    if (!branch) return res.status(404).json({ message: "Branch not found" });

    // ---------------- IMAGE HANDLING ----------------
    let branchImage = branch.branchImage;

    if (req.file) {
      const oldPath = path.join("uploads", branch.branchImage);

      // Safely delete old image if exists
      try {
        await fs.access(oldPath); // Check if file exists
        await fs.unlink(oldPath); // Delete file
        console.log("Old branch image deleted:", oldPath);
      } catch (err) {
        console.warn("Old image not found or already deleted:", oldPath);
      }

      branchImage = req.file.filename; // Use new uploaded file
    }

    // ---------------- UPDATE FIELDS ----------------
    branch.branchName = branchName || branch.branchName;
    branch.branchCode = branchCode || branch.branchCode;
    branch.managerName = managerName || branch.managerName;
    branch.phone = phone || branch.phone;
    branch.email = email || branch.email;
    branch.city = city || branch.city;
    branch.address = address || branch.address;
    branch.active = active ?? branch.active; // 0 or false should be respected
    branch.branchImage = branchImage;
    branch.adminRef = adminId;

    const updatedBranch = await branch.save();

    res.status(200).json({
      message: "Branch updated successfully",
      updatedBranch,
    });
  } catch (error) {
    console.error("UPDATE BRANCH ERROR:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};

// =========================
//   DELETE BRANCH 
// =========================
export const deleteBranch = async (req, res) => {
  try {
    const { id } = req.params;

    const branch = await addBranch.findById(id);
    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    // -------------------------------
    // Delete image if exists
    // -------------------------------
    if (branch.branchImage) {
      const oldPath = path.join("uploads", branch.branchImage);

      try {
        await fs.access(oldPath); // Check if file exists
        await fs.unlink(oldPath); // Delete file
        console.log("Branch image deleted:", oldPath);
      } catch (err) {
        console.log("Branch image delete error (file may not exist):", err);
      }
    }

    // -------------------------------
    // Delete branch document
    // -------------------------------
    await addBranch.findByIdAndDelete(id);

    res.status(200).json({
      message: "Branch deleted successfully",
    });
  } catch (error) {
    console.error("Delete branch error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllBranch = async (req, res) => {
  try {
    const branch = await addBranch.find()

    res.status(201).json(branch)
    
  } catch (error) {
       res.status(500).json({message: error.message || "Server error"});
  }
}