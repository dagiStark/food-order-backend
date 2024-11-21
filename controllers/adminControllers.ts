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
    res.status(200).json(vendors);
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

