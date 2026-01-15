import { addEmployees } from "../model/addEmployeeSchema.js";
import { addBranch } from "../model/branchSchema.js";
import { category } from "../model/CategorySchema.js";
import jwt from "jsonwebtoken";

export const addCategory = async (req, res) => {
  try {
    const { categoryname, description, branchCode } = req.body;

    if (!categoryname || !description) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const findCategory = await category.findOne({ categoryname });

    if (findCategory) {
      return res.status(400).json({ message: "This category already exists" });
    }

    const branch = await addBranch.findOne({ branchCode });

    const createCategory = await category.create({
      categoryname,
      description,
      branchRef: branch ? branch._id : null,
    });

    res.status(201).json({
      createCategory,
      message: "Category Successfully Created",
    });
  } catch (error) {
    console.log("AddCategory Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// get All category
export const getCategory = async (req, res) => {
  
  try {
    const accessToken = req.cookies.refreshToken || req.headers["authorization"]?.split(" ")[1];

    if (!accessToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const decoded = jwt.verify(accessToken, process.env.JWT_REFRESH_SECRET);
    const email = decoded.role;

    const employee = await addEmployees.findOne({ email });
    const branchRef = employee?.branchrefernce;

    let getAllCategory;

    if (branchRef) {
      getAllCategory = await category.find({ branchRef: branchRef });
    } else {
      getAllCategory = await category.find({});
    }

    res.status(201).json({ message: getAllCategory });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Edit Category
export const editCategory = async (req, res) => {
  try {
    const { id, categoryname, description, branchCode } = req.body;

    if (!categoryname) {
      return res.status(400).json({ message: "Category name is required" });
    }

    // Prepare update fields
    const updateData = {
      categoryname,
      description,
    };

    // If branchCode is sent → find branch
    if (branchCode) {
      const branch = await addBranch.findOne({ branchCode });

      if (!branch) {
        return res.status(400).json({ message: "Invalid Branch Code" });
      }

      updateData.branchRef = branch._id;
    }

    // Update category
    const updatedCategory = await category.findOneAndUpdate(
      { _id: id }, // ✔ correct id field
      { $set: updateData },
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({
      message: "Category updated successfully",
      updatedCategory,
    });
  } catch (error) {
    console.log("EditCategory Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// delete category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.body;

    const deleted = await category.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.log("Delete Category Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};
