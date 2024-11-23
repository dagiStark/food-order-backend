import { Request, Response } from "express";
import { DeliveryUser } from "../models";
import {
  generateSalt,
  generateSignature,
  hashPassword,
  validatePassword,
} from "../utility/passwordUtility";
import { AuthPayload } from "../dto";
import { IDeliveryUser } from "../types/type";

export const deliverySignup = async (req: Request, res: Response) => {
  try {
    const { email, phone, password, address, firstName, lastName, pinCode } =
      req.body;

    const salt = generateSalt();

    const hashedPassword = hashPassword(password, salt);

    const deliveryUserExists = await DeliveryUser.findOne({ email });

    if (deliveryUserExists)
      return res.status(400).json({ message: "Delivery user already exists!" });

    const deliveryUser = await DeliveryUser.create({
      email,
      password: hashedPassword,
      salt,
      firstName,
      lastName,
      address,
      phone,
      pinCode,
      verified: false,
      otp: "",
      otp_expiry: new Date(),
      lat: 0,
      lng: 0,
    });

    if (deliveryUser) {
      const signature = generateSignature({
        _id: deliveryUser._id,
        email: deliveryUser.email,
        verified: deliveryUser.verified,
      });

      return res.status(201).json({ signature });
    }

    return res
      .status(400)
      .json({ message: "Error while creating delivery user!" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deliveryLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const deliveryUser = await DeliveryUser.findOne({ email });

    if (!deliveryUser) {
      return res.status(400).json({ message: "Delivery user not found!" });
    }

    if (!validatePassword(password, deliveryUser.password)) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const payload: AuthPayload = {
      _id: deliveryUser._id as any,
      email: deliveryUser.email,
      verified: deliveryUser.verified,
    };

    const signature = generateSignature(payload);

    return res.status(200).json({
      data: payload,
      signature,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getDeliveryProfile = async (req: Request, res: Response) => {
  try {
    const deliveryUser = req.user;

    if (deliveryUser) {
      const profile = await DeliveryUser.findById(deliveryUser._id);

      if (profile) {
        res.status(200).json(profile);
      } else {
        res.status(404).json({ message: "No delivery profile found" });
      }
    }
    return res.status(400).json({ message: "no delivery user found!" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error!" });
  }
};

export const editDeliveryProfile = async (req: Request, res: Response) => {
  try {
    const deliveryUser = req.body;

    const { firstName, lastName, address, phone } = req.body;

    if (deliveryUser) {
      const profile = await DeliveryUser.findById(deliveryUser._id);

      if (profile) {
        profile.firstName = firstName;
        profile.lastName = lastName;
        profile.address = address;
        profile.phone = phone;

        const result = await profile.save();

        res.status(200).json(result);
      }
    }

    return res.status(400).json({ message: "no delivery user found!" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error!" });
  }
};



export const updateDeliveryUserStatus = async (req: Request, res: Response) => {
  try {
    const deliveryUser = req.body;
    const { lat, lng } = req.body;
    if (deliveryUser) {
      const profile = (await DeliveryUser.findById(
        deliveryUser._id
      )) as IDeliveryUser;
      if (profile) {
        profile.lat = lat;
        profile.lng = lng;
      }

      profile.isAvailable = !profile.isAvailable;

      const result = await profile.save();
      res.status(200).json(result);
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error!" });
  }
};
