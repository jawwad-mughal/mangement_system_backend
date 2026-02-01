import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BankAccount",
      required: true,
    },
    type: {
      type: String,
      enum: ["Deposit", "Withdraw"],
      required: true,
    },
    mode: {
      type: String,
      enum: ["Cash", "Online"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    source: String,
    description: String,
  },
  { timestamps: true }
);

export default mongoose.model("Transaction", transactionSchema);
