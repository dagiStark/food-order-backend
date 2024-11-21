import bcrypt from "bcrypt";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";

export const generateSalt = () => {
  return bcrypt.genSaltSync(10);
};

export const hashPassword = (password: string, salt: string) => {
  return bcrypt.hashSync(password, salt);
};

export const validatePassword = (
  enteredPassword: string,
  savedPassword: string
) => {
  return bcrypt.compareSync(enteredPassword, savedPassword);
};

export const generateSignature = (payload: any) => {
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: "24h",
  });
};



export const validateSignature = async (req: Request, res: Response) => {

  const signature = req.get("Authorization")

  if(signature){
    const token = signature.split(" ")[1]
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any
      req.user = decoded
      return true
    } catch (error) {
      return false
    }
  }
};
