import mongoose, { Schema, Document, Model } from "mongoose";

const FoodSchema = new Schema(
  {
    vendorId: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String },
    foodType: { type: String, required: true },
    price: { type: Number },
    rating: { type: Number },
    image: { type: [String] },
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

export const Food = mongoose.model("food", FoodSchema);
