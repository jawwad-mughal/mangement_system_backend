import mongoose from "mongoose";

const stockSchema = new mongoose.Schema({
    productname: {
        type: String,
        required: true,
    },
    qty: {
        type: String,
        required: true,
    },
    unit: {
        type: String,
        required: true,
    },
    supplier: {
        type: String,
        required: true,
    },
    date: {
        type: String,
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "categorys"
    },

},{timestamps: true})

export const addStock = mongoose.model("addStocks", stockSchema)