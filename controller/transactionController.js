import Transaction from "../model/transactionSchema.js";
import BankAccount from "../model/BankAccountSchema.js";

// CREATE
export const createTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.create(req.body);

    await BankAccount.findByIdAndUpdate(
      req.body.account,
      { $inc: { balance: req.body.amount } }
    );

    res.status(201).json({ success: true, transaction });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET

export const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate("account", "bankName holderName") // <-- correct field names
      .sort({ createdAt: -1 });

    res.json({ success: true, transactions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// UPDATE
export const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const oldTx = await Transaction.findById(id);
    if (!oldTx) return res.status(404).json({ message: "Not found" });

    // rollback old balance
    await BankAccount.findByIdAndUpdate(
      oldTx.account,
      { $inc: { balance: -oldTx.amount } }
    );

    const updatedTx = await Transaction.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );

    // apply new balance
    await BankAccount.findByIdAndUpdate(
      req.body.account,
      { $inc: { balance: req.body.amount } }
    );

    res.json({ success: true, transaction: updatedTx });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE
export const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const tx = await Transaction.findById(id);
    if (!tx) return res.status(404).json({ message: "Not found" });

    await BankAccount.findByIdAndUpdate(
      tx.account,
      { $inc: { balance: -tx.amount } }
    );

    await tx.deleteOne();

    res.json({ success: true, message: "Transaction deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
