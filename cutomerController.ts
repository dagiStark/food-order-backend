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

export const customerLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await Customer.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    if (!validatePassword(password, user.password)) {
      return res.status(400).json({ message: "Invalid password" });
    }
    const payload: AuthPayload = {
      _id: user._id as string,
      email: user.email,
      verified: user.verified,
    };
    const signature = generateSignature(payload);
    res.status(200).json({
      data: payload,
      signature,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error while logging in" });
  }
};

export const customerVerify = async (req: Request, res: Response) => {
  try {
    const { otp } = req.body;

    if (!otp || isNaN(otp)) {
      return res.status(400).json({ message: "Invalid OTP format" });
    }

    const customer = req.user;

    if (!customer) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const profile = await Customer.findById(customer._id);

    if (!profile) {
      return res.status(404).json({ message: "User not found" });
    }

    if (
      parseInt(profile.otp) === parseInt(otp) &&
      new Date(profile.otp_expiry) >= new Date()
    ) {
      profile.verified = true;

      const result = await profile.save();

      const signature = generateSignature({
        _id: result._id,
        email: result.email,
        verified: result.verified,
      });

      return res.status(200).json({ data: result, signature });
    }
    return res.status(400).json({ message: "Invalid OTP" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


