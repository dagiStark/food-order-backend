import { Document, Schema, Model } from "mongoose";

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

