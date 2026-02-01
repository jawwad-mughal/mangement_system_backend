
import BankAccount from "../model/BankAccountSchema.js";
import { addBranch } from "../model/branchSchema.js";

/* ================= CREATE ================= */
export const createBankAccount = async (req, res) => {
  try {
    const { bankName, accountNumber, holderName, balance, branchCode, type, openDate } = req.body;

    if (!bankName || !accountNumber || !holderName || !balance || !branchCode) {
      return res.status(400).json({ success: false, message: "Required fields missing" });
    }

    const exists = await BankAccount.findOne({ accountNumber });
    if (exists) return res.status(400).json({ success: false, message: "Account already exists" });

    const branchDoc = await addBranch.findOne({ branchCode });
    if (!branchDoc) return res.status(400).json({ success: false, message: "Invalid branch code" });

    const account = await BankAccount.create({
      bankName,
      accountNumber,
      holderName,
      balance,
      type,
      openDate,
      branchRef: branchDoc._id,
    });

    res.status(201).json({ success: true, data: account });
  } catch (error) {
    console.error("CREATE ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================= GET ALL ================= */
export const getBankAccounts = async (req, res) => {
  try {
    const accounts = await BankAccount.find()
      .populate("branchRef", "branchName branchCode city")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: accounts });
  } catch (error) {
    console.error("GET ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================= UPDATE ================= */
export const editBankAccount = async (req, res) => {
  try {
    const { id, branchCode, ...rest } = req.body;
    const updateData = { ...rest };

    if (branchCode) {
      const branchDoc = await addBranch.findOne({ branchCode });
      if (!branchDoc) return res.status(400).json({ success: false, message: "Invalid branch code" });
      updateData.branchRef = branchDoc._id;
    }

    const updated = await BankAccount.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: "Account not found" });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error("UPDATE ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================= DELETE ================= */
export const deleteBankAccount = async (req, res) => {
  try {
    const { id } = req.body;
    await BankAccount.findByIdAndDelete(id);
    res.status(200).json({ success: true, data: id });
  } catch (error) {
    console.error("DELETE ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};







