import { Request, Response } from "express";
import { Offer, Vendor } from "../models";

export const getFoodAvailability = async (req: Request, res: Response) => {
  try {
    const pinCode = req.params.pinCode;

    const result = await Vendor.find({ pinCode, serviceAvailable: true })
      .sort([["rating", "desc"]])
      .populate("foods");

    if (result.length > 0) {
      return res.status(200).json({ data: result });
    }

    return res.status(400).json({ message: "No food available now!" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getTopRestaurants = async (req: Request, res: Response) => {
  try {
    const pinCode = req.params.pinCode;

    const result = await Vendor.find({ pinCode, serviceAvailable: true })
      .sort([["rating", "desc"]])
      .limit(10);

    if (result.length > 0) {
      return res.status(200).json({ data: result });
    }
    return res.status(400).json({ message: "No Restaurants found!" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

