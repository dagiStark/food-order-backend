import { Request, Response } from "express";

import {
  generateSalt,
  hashPassword,
  generateSignature,
  validatePassword,
} from "./utility/passwordUtility";
import { generateOtp, onRequestOtp } from "./utility/notificationUtility";
import { Customer } from "./models";
import { AuthPayload } from "./dto";

export const customerSignup = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, phone, address } = req.body;

    const user = await Customer.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }
    const salt = generateSalt();
    const hashedPassword = hashPassword(password, salt);

    const { otp, expiry } = generateOtp();

    const newUser = await Customer.create({
      email,
      password: hashedPassword,
      salt,
      firstName,
      lastName,
      phone,
      address,
      verified: false,
      otp,
      otp_expiry: expiry,
      lat: 0,
      lng: 0,
      cart: [],
      orders: [],
    });

    if (newUser) {
      const otpSent = await onRequestOtp(otp, phone);
      if (!otpSent) {
        return res
          .status(500)
          .json({ message: "Failed to send OTP. Please try again later." });
      }

      const signature = generateSignature({
        _id: newUser._id,
        email: newUser.email,
        verified: newUser.verified,
      });

      res.status(201).json({
        data: newUser,
        signature,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error while creating user" });
  }
};
