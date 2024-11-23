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

