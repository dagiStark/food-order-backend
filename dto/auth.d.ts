import { VendorPayload } from "./vendor";
import { CustomerPayload } from "./customer";

export type AuthPayload = VendorPayload | CustomerPayload;