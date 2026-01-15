import BankAccount from "../model/BankAccountSchema.js";

// CREATE BANK ACCOUNT
export const createBankAccount = async (req, res) => {
  try {
    const {
      bankName,
      accountNumber,
      holderName,
      balance,
      branch,
      type,
      openDate,
    } = req.body;

    // Validation
    if (!bankName || !accountNumber || !balance) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }

    // Check duplicate account number
    const exists = await BankAccount.findOne({ accountNumber });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Account number already exists",
      });
    }

    const account = await BankAccount.create({
      bankName,
      accountNumber,
      holderName,
      balance,
      branch,
      type,
      openDate,
    });

    res.status(201).json({
      success: true,
      message: "Bank account created successfully",
      data: account,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
