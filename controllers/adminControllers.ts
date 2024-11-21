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

