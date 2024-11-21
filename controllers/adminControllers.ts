import { Request, Response, NextFunction } from "express";
import { DeliveryUser, Vendor } from "../models";
import { generateSalt, hashPassword } from "../utility/passwordUtility";
import { Transaction } from "../models";

export const findVendor = async (id: string | undefined, email?: string) => {
  try {
    if (email) {
      return await Vendor.findOne({ email: email });
    } else {
      return await Vendor.findById(id);
    }
  } catch (error) {
    console.log("Error while fetching Vendor: ", error);
    return;
  }
};

export const CreateVendor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    name,
    address,
    pinCode,
    foodType,
    email,
    phone,
    password,
    ownerName,
  } = req.body;

  const existingVendor = await Vendor.findOne({ email });
  if (existingVendor) {
    return res.status(400).json({ message: "Vendor already exists" });
  }

  const salt = generateSalt();
  const hashedPassword = hashPassword(password, salt);

  const vendor = new Vendor({
    name,
    address,
    pinCode,
    foodType,
    email,
    phone,
    password: hashedPassword,
    salt,
    ownerName,
    rating: 0,
    serviceAvailable: false,
    coverImages: [],
    lat: 0,
    lng: 0,
  });
  try {
    await vendor.save();
    res.status(201).json(vendor);
  } catch (error) {
    res.status(500).json({ message: "Error creating vendor" });
  }
};

export const getVendors = async (req: Request, res: Response) => {
  try {
    const vendors = await Vendor.find();
    if (!vendors) return res.status(200).json({ message: "No vendors found" });
    res.status(200).json({ data: vendors });
  } catch (error) {
    res.status(500).json({ message: "Error fetching vendors" });
  }
};

export const getVendorById = async (req: Request, res: Response) => {
  try {
    const vendorId = req.params.id;
    const vendor = await Vendor.findById(vendorId);

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    res.status(200).json({ data: vendor });
  } catch (error: any) {
    console.error("Error fetching vendor:", error.message);

    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid vendor ID format" });
    }

    res
      .status(500)
      .json({ message: "An error occurred while retrieving the vendor" });
  }
};

export const getTransactions = async (req: Request, res: Response) => {
  try {
    const transactions = await Transaction.find();
    if (!transactions)
      return res.status(200).json({ message: "No transactions found" });
    res.status(200).json({ data: transactions });
  } catch (error) {
    res.status(500).json({ message: "Error fetching transactions" });
  }
};

export const getTransactionById = async (req: Request, res: Response) => {
  try {
    const transactionId = req.params.id;
    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.status(200).json({ data: transaction });
  } catch (error: any) {
    console.error("Error fetching transaction:", error.message);

    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid transaction ID format" });
    }

    res
      .status(500)
      .json({ message: "An error occurred while retrieving the transaction" });
  }
};

export const verifyDeliveryUser = async (req: Request, res: Response) => {
  const { _id, status } = req.body;
  try {
    const profile = await DeliveryUser.findById(_id);
    if (!profile) return res.status(404).json({ message: "No user found" });

    profile.verified = status;
    const result = await profile.save();
    res.status(200).json({ data: result });
  } catch (error) {
    res.status(500).json({ message: "Error while verifying user" });
  }
};

export const getDeliveryUsers = async (req: Request, res: Response) => {
  try {
    const deliveryUsers = await DeliveryUser.find({});
    if (deliveryUsers) {
      res.status(200).json({ data: deliveryUsers });
    } else {
      res.status(404).json({ message: "No delivery users found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error while fetching delivery users" });
  }
};

