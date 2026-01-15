import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    categoryname: {
        type: String,
        required: true,
        unique: true 
    },
    description: {
        type: String,
        required: true
    },
    branchRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "addBranchs",
        required: true

    }
},{timestamps: true})

export const category = mongoose.model("categorys", categorySchema)