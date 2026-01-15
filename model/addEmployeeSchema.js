import mongoose from "mongoose";

const accessSchema = new mongoose.Schema(
  {
    sectionaccess: { type: Boolean, default: false },
    view: { type: Boolean, default: false },
    create: { type: Boolean, default: false },
    edit: { type: Boolean, default: false },
    delete: { type: Boolean, default: false },
  },
  { _id: false }
);

const employeeSchema = new mongoose.Schema({
    employeeName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    position: {
        type: String,
        required: true,
    },
    salary: {
        type: Number,
        required: true,
    },
    branchName: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    image: { 
        type: String,
        required: true,
    },
    access: {
      dashboard: { type: accessSchema, default: {} },
      branch: { type: accessSchema, default: {} },
      inventory: { type: accessSchema, default: {} },
      product: { type: accessSchema, default: {} },
      employees: { type: accessSchema, default: {} },
      banking: { type: accessSchema, default: {} },
      invoice: { type: accessSchema, default: {} },
      order: { type: accessSchema, default: {} },
      customer: { type: accessSchema, default: {} },
      report: { type: accessSchema, default: {} },
      setting: { type: accessSchema, default: {} },
    },
    refreshToken: { 
        type: String, 
        default: "" 
    },
    branchrefernce: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "addBranchs", 
        default: null      
    }
},{ timestamps: true })

export const addEmployees = mongoose.model("addEmployees", employeeSchema)