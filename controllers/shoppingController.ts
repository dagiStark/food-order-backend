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

export const getFoodsIn30Min = async (req: Request, res: Response) => {
  try {
    const pinCode = req.params.pinCode;

    const result = await Vendor.find({ pinCode, serviceAvailable: true })
      .sort([["rating", "desc"]])
      .populate("foods");

    if (result.length > 0) {
      let foodResult = Array();
      result.map((vendor) => {
        vendor.foods.map((food) => {
          foodResult.push(food);
        });
      });
      return res.status(200).json({ data: foodResult });
    }
    return res.status(400).json({ message: "No Foods are available!" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const searchFoods = async (req: Request, res: Response) => {
  try {
    const pinCode = req.params.pinCode;
    const result = await Vendor.find({ pinCode, serviceAvailable: true })
      .sort([["rating", "desc"]])
      .populate("foods");
    if (result.length > 0) {
      let foodResult = Array();
      result.map((vendor) => foodResult.push(...vendor.foods));
      return res.status(200).json({ data: foodResult });
    }
    return res.status(400).json({ message: "No Foods are available!" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getRestaurantById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const restaurant = await Vendor.findById(id).populate("foods");
    if (restaurant) {
      return res.status(200).json({ data: restaurant });
    }
    return res.status(400).json({ message: "No Restaurant found!" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAvailableOffers = async (req: Request, res: Response) => {
  try {
    const pinCode = req.params.pinCode;

    const offers = await Offer.find({ pinCode, isActive: true });

    if (offers.length > 0) {
      return res.status(200).json({ data: offers });
    }
    return res.status(400).json({ message: "No Offers are available!" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
