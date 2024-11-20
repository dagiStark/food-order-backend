import mongoose, { Schema, Document, Model } from "mongoose";
import { IVendor } from "../types/type";

const VendorSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    ownerName: { type: String, required: true },
    foodType: { type: [String] },
    pinCode: { type: String, required: true },
    address: { type: String },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    salt: { type: String, required: true },
    serviceAvailable: { type: Boolean },
    coverImages: { type: [String] },
    rating: { type: Number },
    foods: [{ type: Schema.Types.ObjectId, ref: "food" }],
    lat: { type: Number },
    lng: { type: Number },
  },
  {
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v,
          delete ret.createdAt,
          delete ret.updatedAt,
          delete ret.password,
          delete ret.salt;
      },
    },
    timestamps: true,
  }
);

export const Vendor: Model<IVendor> = mongoose.model<IVendor>(
  "vendor",
  VendorSchema
);
