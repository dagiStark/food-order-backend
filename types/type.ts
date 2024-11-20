import mongoose, { Document, Schema, Model } from "mongoose";

export interface ICustomer extends Document {
  email: string;
  password: string;
  salt: string;
  firstName: string;
  lastName: string;
  address: string;
  phone: string;
  verified: boolean;
  otp: string;
  otp_expiry: Date;
  lat: number;
  lng: number;
  cart: [any];
  orders: [IOrder];
}

export interface IOrder extends Document {
  orderId: string;
  vendorId: string;
  items: [any];
  totalAmount: number;
  paidAmount: number;
  orderDate: Date;
  orderStatus: string;
  remarks: string;
  deliveryId: string;
  readyTime: number;
}

export interface IFood extends Document {
  vendorId: string;
  name: string;
  description: string;
  category: string;
  foodType: string;
  price: number;
  rating: number;
  image: [string];
}

export interface IOffer extends Document {
  offerType: string;
  vendors: mongoose.Types.ObjectId[];
  title: string;
  description?: string;
  minValue: number;
  startValidity?: Date;
  endValidity?: Date;
  promoCode: string;
  promoType: string;
  bank?: string[];
  bins?: number[];
  pinCode: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
