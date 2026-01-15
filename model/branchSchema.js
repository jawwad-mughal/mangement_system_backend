import mongoose from "mongoose";

const branchSchema = new mongoose.Schema({
    branchImage: {
        type: String,
        required: true,
    },
    branchName: {
        type: String,
        required: true
    },
    branchCode: {
        type: String,
        required: true,
        unique: true
    },
    managerName: {
        type: String,
        required: true,
    },
    phone: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    active: {
        type: String,
        required: true
    },
    adminRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "createAdmins",
        required: true
    }

},{timestamps: true})

export const addBranch = mongoose.model("addBranchs", branchSchema)