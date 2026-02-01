import mongoose from "mongoose";

const bankAccountSchema = new mongoose.Schema(
  {
    bankName: { type: String, required: true },
    accountNumber: { type: String, required: true, unique: true },
    holderName: { type: String, required: true },
    balance: { type: Number, required: true },
    type: { type: String, enum: ["Current", "Savings", "Business"], default: "Current" },
    openDate: { type: Date, required: true },
    branchRef: { type: mongoose.Schema.Types.ObjectId, ref: "addBranchs", required: true },
  },
  { timestamps: true }
);

export default mongoose.model("BankAccount", bankAccountSchema);



