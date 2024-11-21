export interface CreateVendorInput{
    name: string;
    ownerName: string;
    foodType: [string];
    pinCode: string;
    address: string;
    phone: string;
    email: string;
    password: string;
}

export interface EditVendorInput{
    name: string;
    address: string;
    phone: string;
    foodType:[string]
}

export interface VendorLoginInput {
    email: string
    password: string
}

export interface VendorPayload {

    _id: string;
    email: string;
    name: string;

}

export interface CreateOfferInputs {
    offerType: string;
    vendors: [any];
    title: string;
    description: string;
    minValue: number;
    offerAmount: number;
    startValidity: Date;
    endValidity: Date;
    promoCode: string;
    promoType: string;
    bank: [any];
    bins: [any];
    pinCode: string;
    isActive: boolean;
}