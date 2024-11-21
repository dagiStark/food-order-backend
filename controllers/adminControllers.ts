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

