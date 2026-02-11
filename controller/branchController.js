import addBranch from "../model/BankAccountSchema.js";
import cloudinary from "../services/cloudinaryConfig.js";
import jwt from "jsonwebtoken";

/* ===================== TOKEN VERIFY HELPER ===================== */
const verifyAdmin = (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return null;

    const token = authHeader.split(" ")[1];
    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    if (decoded.name !== "admin") return null;

    return decoded;
  } catch (error) {
    return null;
  }
};

/* ===================== CREATE BRANCH ===================== */
export const createBranch = async (req, res) => {
  try {
    const admin = verifyAdmin(req, res);
    if (!admin)
      return res.status(401).json({ message: "Unauthorized (Admin only)" });

    const {
      branchName,
      branchCode,
      managerName,
      phone,
      email,
      city,
      address,
      active,
    } = req.body;

    if (
      !branchName ||
      !branchCode ||
      !managerName ||
      !phone ||
      !email ||
      !city ||
      !address
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const exists = await addBranch.findOne({ branchCode });
    if (exists)
      return res.status(409).json({ message: "Branch already exists" });

    if (!req.file)
      return res.status(400).json({ message: "Branch image required" });

    const upload = await cloudinary.uploader.upload(
      `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
      { folder: "branches" }
    );

    const branch = await addBranch.create({
      branchName,
      branchCode,
      managerName,
      phone,
      email,
      city,
      address,
      active: active ?? true,
      branchImage: upload.secure_url,
      cloudinary_id: upload.public_id,
      adminRef: admin.id,
    });

    res.status(201).json({
      success: true,
      message: "Branch created successfully",
      branch,
    });
  } catch (error) {
    console.error("Create Branch Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ===================== GET ALL BRANCH ===================== */
export const getAllBranch = async (req, res) => {
  try {
    const admin = verifyAdmin(req, res);
    if (!admin)
      return res.status(401).json({ message: "Unauthorized (Admin only)" });

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [branches, total] = await Promise.all([
      addBranch
        .find({ adminRef: admin.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      addBranch.countDocuments({ adminRef: admin.id }),
    ]);

    res.status(200).json({
      success: true,
      totalBranches: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      branches,
    });
  } catch (error) {
    console.error("Fetch Branch Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ===================== GET SINGLE BRANCH ===================== */
export const getSingleBranch = async (req, res) => {
  try {
    const admin = verifyAdmin(req, res);
    if (!admin)
      return res.status(401).json({ message: "Unauthorized (Admin only)" });

    const branch = await addBranch.findById(req.params.id);
    if (!branch)
      return res.status(404).json({ message: "Branch not found" });

    res.status(200).json({ success: true, branch });
  } catch (error) {
    console.error("Get Single Branch Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ===================== UPDATE BRANCH ===================== */
export const updateBranch = async (req, res) => {
  try {
    const admin = verifyAdmin(req, res);
    if (!admin)
      return res.status(401).json({ message: "Unauthorized (Admin only)" });

    const branch = await addBranch.findById(req.params.id);
    if (!branch)
      return res.status(404).json({ message: "Branch not found" });

    if (req.file) {
      if (branch.cloudinary_id) {
        await cloudinary.uploader.destroy(branch.cloudinary_id);
      }

      const upload = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
        { folder: "branches" }
      );

      branch.branchImage = upload.secure_url;
      branch.cloudinary_id = upload.public_id;
    }

    Object.assign(branch, req.body);
    await branch.save();

    res.status(200).json({
      success: true,
      message: "Branch updated successfully",
      branch,
    });
  } catch (error) {
    console.error("Update Branch Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ===================== DELETE BRANCH ===================== */
export const deleteBranch = async (req, res) => {
  try {
    const admin = verifyAdmin(req, res);
    if (!admin)
      return res.status(401).json({ message: "Unauthorized (Admin only)" });

    const branch = await addBranch.findById(req.params.id);
    if (!branch)
      return res.status(404).json({ message: "Branch not found" });

    if (branch.cloudinary_id) {
      await cloudinary.uploader.destroy(branch.cloudinary_id);
    }

    await branch.deleteOne();

    res.status(200).json({
      success: true,
      message: "Branch deleted successfully",
    });
  } catch (error) {
    console.error("Delete Branch Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

