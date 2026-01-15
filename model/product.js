// models/Product.js
import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    images: [
    {
      url: { type: String, required: true },
      public_id: { type: String, required: true },
    }
  ],
    branchRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "addBranchs",
      // required: true
    }, 
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
