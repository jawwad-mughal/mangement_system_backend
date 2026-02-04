import BankAccount from "../model/BankAccountSchema.js";
import Transaction from "../model/transactionSchema.js";

export const getAccountSummaryByNumber = async (req, res) => {
  try {
    const { accountNumber } = req.params;

    // 🔍 Find bank account
    const account = await BankAccount
      .findOne({ accountNumber })
      .populate("branchRef");

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    // 🔍 Find transactions using existing `account` field
    const transactions = await Transaction.find({
      account: account._id,
    })
      .sort({ date: -1 })
      .populate("account", "bankName branchCode");

    res.status(200).json({
      account,
      transactions,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
