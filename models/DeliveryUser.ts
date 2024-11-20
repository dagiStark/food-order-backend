import mongoose, { Document, Schema, Model } from "mongoose";
import { IDeliveryUser } from "../types/type";

const DeliveryUserSchema: Schema = new Schema(
  {
    email: { type: String, required: true },
    password: { type: String, required: true },
    salt: { type: String, required: true },
    firstName: { type: String },
    lastName: { type: String },
    address: { type: String },
    phone: { type: String, required: true },
    pincode: { type: String },
    verified: { type: Boolean },
    otp: { type: Number },
    otp_expiry: { type: Date },
    lat: { type: Number },
    lng: { type: Number },
    isAvailable: { type: Boolean, default: false },
  },
  {
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.salt;
        delete ret.__v;
        delete ret.createdAt;
        delete ret.updatedAt;
      },
    },
    timestamps: true,
  }
);

export const DeliveryUser: Model<IDeliveryUser> = mongoose.model<IDeliveryUser>(
  "deliveryUser",
  DeliveryUserSchema
);
