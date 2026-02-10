import { addBranch } from "../model/branchSchema.js";
import cloudinary from "../services/cloudinaryConfig.js";
import jwt from "jsonwebtoken";

// ---------------- CREATE BRANCH ----------------
export const createBranch = async (req, res) => {
  try {
    const accessToken =
      req.cookies.refreshToken || req.headers["authorization"]?.split(" ")[1];
    if (!accessToken) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(accessToken, process.env.JWT_REFRESH_SECRET);
    if (decoded?.name !== "admin")
      return res.status(401).json({ message: "Create Branch Only Admin" });

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

    if (!branchName || !managerName || !phone || !email || !address || !active || !city || !branchCode)
      return res.status(400).json({ message: "All Fields are Required" });

    const existingBranch = await addBranch.findOne({ branchCode });
    if (existingBranch)
      return res.status(409).json({ message: "Branch already exists" });

    // Upload image to Cloudinary
    if (!req.file) return res.status(400).json({ message: "Image required" });

    const uploadedImage = await cloudinary.uploader.upload(
      `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
      { folder: "branches" }
    );

    const branch = await addBranch.create({
      branchImage: uploadedImage.secure_url,
      branchName,
      branchCode,
      managerName,
      phone,
      email,
      city,
      address,
      active,
      adminRef: decoded.id,
      cloudinary_id: uploadedImage.public_id, // store for future delete
    });

    res.status(200).json({ branch, message: "Branch Successfully Created" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------- GET ALL BRANCH ----------------
export const fetchBranch = async (req, res) => {
  try {
    const accessToken =
      req.cookies.refreshToken || req.headers["authorization"]?.split(" ")[1];
    if (!accessToken) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(accessToken, process.env.JWT_REFRESH_SECRET);
    if (decoded?.name !== "admin")
      return res.status(401).json({ message: "Admin only" });

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const branches = await addBranch
      .find({ adminRef: decoded.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalDoc = await addBranch.countDocuments({ adminRef: decoded.id });

    res.status(200).json({
      totalPages: Math.ceil(totalDoc / limit),
      hasMore: page * limit < totalDoc,
      branches,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------------- GET SINGLE BRANCH ----------------
export const getSingle = async (req, res) => {
  try {
    const { id } = req.params;
    const branch = await addBranch.findById(id);
    if (!branch) return res.status(404).json({ message: "Branch not found" });

    res.status(200).json(branch);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------------- UPDATE BRANCH ----------------
export const updateBranch = async (req, res) => {
  try {
    const accessToken =
      req.cookies.refreshToken || req.headers["authorization"]?.split(" ")[1];
    if (!accessToken) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(accessToken, process.env.JWT_REFRESH_SECRET);
    if (decoded?.name !== "admin")
      return res.status(401).json({ message: "Update Branch Only Admin" });

    const { branchId, branchName, managerName, phone, city, email, address, active, branchCode } = req.body;
    if (!branchId) return res.status(400).json({ message: "Branch ID required" });

    const branch = await addBranch.findById(branchId);
    if (!branch) return res.status(404).json({ message: "Branch not found" });

    // If new image, delete old from Cloudinary
    if (req.file) {
      if (branch.cloudinary_id) {
        await cloudinary.uploader.destroy(branch.cloudinary_id);
      }

      const uploadedImage = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
        { folder: "branches" }
      );
      branch.branchImage = uploadedImage.secure_url;
      branch.cloudinary_id = uploadedImage.public_id;
    }

    branch.branchName = branchName || branch.branchName;
    branch.branchCode = branchCode || branch.branchCode;
    branch.managerName = managerName || branch.managerName;
    branch.phone = phone || branch.phone;
    branch.email = email || branch.email;
    branch.city = city || branch.city;
    branch.address = address || branch.address;
    branch.active = active ?? branch.active;

    const updatedBranch = await branch.save();
    res.status(200).json({ message: "Branch updated successfully", updatedBranch });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------------- DELETE BRANCH ----------------
export const deleteBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const branch = await addBranch.findById(id);
    if (!branch) return res.status(404).json({ message: "Branch not found" });

    if (branch.cloudinary_id) {
      await cloudinary.uploader.destroy(branch.cloudinary_id);
    }

    await addBranch.findByIdAndDelete(id);
    res.status(200).json({ message: "Branch deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
