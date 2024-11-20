import mongoose, { Schema, Model } from "mongoose";
import { ITransaction } from "../types/type";

const TransactionSchema: Schema = new Schema(
  {
    customer: String,
    vendorId: String,
    orderId: String,
    orderValue: Number,
    offerUsed: String,
    status: String,
    paymentMode: String,
    PaymentResponse: String,
  },
  {
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v;
      },
    },
    timestamps: true,
  }
);

export const Transaction: Model<ITransaction> = mongoose.model<ITransaction>(
  "transaction",
  TransactionSchema
);
