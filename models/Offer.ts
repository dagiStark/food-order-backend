import mongoose, { Schema, Document, Model } from "mongoose";
import { IOffer } from "../types/type";

const OfferSchema: Schema = new Schema(
  {
    offerType: { type: String, required: true },
    vendors: [{ type: Schema.Types.ObjectId, ref: "vendor" }],
    title: { type: String, required: true },
    description: { type: String },
    minValue: { type: Number, required: true },
    offerAmount: {type: Number, required: true},
    startValidity: Date,
    endValidity: Date,
    promoCode: { type: String, required: true },
    promoType: { type: String, required: true },
    bank: [{ type: String }],
    bins: [{ type: Number }],
    pinCode: { type: String, required: true },
    isActive: Boolean,
  },
  {
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v, delete ret.createdAt, delete ret.updatedAt;
      },
    },
    timestamps: true,
  }
);

export const Offer: Model<IOffer> = mongoose.model<IOffer>(
  "offer",
  OfferSchema
);
