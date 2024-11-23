import { Request, Response } from "express";

import {
  generateSalt,
  hashPassword,
  generateSignature,
  validatePassword,
} from "./utility/passwordUtility";
import { generateOtp, onRequestOtp } from "./utility/notificationUtility";
import { Customer, DeliveryUser, Food, Order, Vendor, Transaction, Offer } from "./models";
import { AuthPayload, CartItem } from "./dto";
import { ICustomer, IFood, IOffer, ITransaction } from "./types/type";

export const customerSignup = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, phone, address } = req.body;

    const user = await Customer.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }
    const salt = generateSalt();
    const hashedPassword = hashPassword(password, salt);

    const { otp, expiry } = generateOtp();

    const newUser = await Customer.create({
      email,
      password: hashedPassword,
      salt,
      firstName,
      lastName,
      phone,
      address,
      verified: false,
      otp,
      otp_expiry: expiry,
      lat: 0,
      lng: 0,
      cart: [],
      orders: [],
    });

    if (newUser) {
      const otpSent = await onRequestOtp(otp, phone);
      if (!otpSent) {
        return res
          .status(500)
          .json({ message: "Failed to send OTP. Please try again later." });
      }

      const signature = generateSignature({
        _id: newUser._id,
        email: newUser.email,
        verified: newUser.verified,
      });

      res.status(201).json({
        data: newUser,
        signature,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error while creating user" });
  }
};

export const customerLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await Customer.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    if (!validatePassword(password, user.password)) {
      return res.status(400).json({ message: "Invalid password" });
    }
    const payload: AuthPayload = {
      _id: user._id as string,
      email: user.email,
      verified: user.verified,
    };
    const signature = generateSignature(payload);
    res.status(200).json({
      data: payload,
      signature,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error while logging in" });
  }
};

export const customerVerify = async (req: Request, res: Response) => {
  try {
    const { otp } = req.body;

    if (!otp || isNaN(otp)) {
      return res.status(400).json({ message: "Invalid OTP format" });
    }

    const customer = req.user;

    if (!customer) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const profile = await Customer.findById(customer._id);

    if (!profile) {
      return res.status(404).json({ message: "User not found" });
    }

    if (
      parseInt(profile.otp) === parseInt(otp) &&
      new Date(profile.otp_expiry) >= new Date()
    ) {
      profile.verified = true;

      const result = await profile.save();

      const signature = generateSignature({
        _id: result._id,
        email: result.email,
        verified: result.verified,
      });

      return res.status(200).json({ data: result, signature });
    }
    return res.status(400).json({ message: "Invalid OTP" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const requestOtp = async (req: Request, res: Response) => {
  try {
    const customer = req.user;

    if (!customer) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const profile = await Customer.findById(customer._id);

    if (!profile) {
      return res.status(404).json({ message: "User not found" });
    }

    const { otp, expiry } = generateOtp();

    profile.otp = String(otp);
    profile.otp_expiry = expiry;

    const result = await profile.save();

    const sendCode = await onRequestOtp(otp, result.phone);

    if (!sendCode) {
      return res.status(400).json({ message: "Failed to send OTP" });
    }

    return res.status(200).json({ message: "OTP sent!" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error on OTP" });
  }
};

export const getCustomerProfile = async (req: Request, res: Response) => {
  try {
    const customer = req.user;

    const profile = await Customer.findById(customer._id);

    if (!profile) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ data: profile });
  } catch (error) {
    res.status(500).json({ message: "Error while fetching profile" });
  }
};

export const editCustomerProfile = async (req: Request, res: Response) => {
  try {
    const customer = req.user;

    const profile = await Customer.findById(customer._id);

    if (!profile) {
      return res.status(404).json({ message: "User not found" });
    }

    const { firstName, lastName, address } = req.body;

    profile.firstName = firstName;
    profile.lastName = lastName;
    profile.address = address;

    const result = await profile.save();

    res.status(200).json({ data: result });
  } catch (error) {
    res.status(500).json({ message: "Error while editing profile" });
  }
};

// Delivery Notification

export const assignOrderForDelivery = async (
  orderId: string,
  vendorId: string
) => {
  try {
    const vendor = await Vendor.findById(vendorId);

    if (!vendor) {
      return "No vendor found!";
    }

    const areaCode = vendor.pinCode;

    const order = await Order.findById(orderId);

    if (!order) return "No Order found!";

    const deliveryPerson = await DeliveryUser.find({
      pinCode: areaCode,
      verified: true,
      isAvailable: true,
    });

    if (!deliveryPerson) {
      return "Delivery person not found!";
    }

    order.deliveryId = deliveryPerson[0]._id as string;
    await order.save();
  } catch (error) {
    console.log(error);
    return "Error while assigning order for delivery";
  }
};



const validateTransaction = async(txnId: string){
  const currentTransaction = await Transaction.findById(txnId) as ITransaction

  if(currentTransaction){
    if(currentTransaction.status.toLowerCase() !== 'failed'){
      return {status: true, currentTransaction}
    }
  }

  return {status: false, currentTransaction}
}



//Order section

export const createOrder = async(req: Request, res: Response)=>{

  try {
    const customer = req.user
    const {txnId, amount, items}= req.body

    if(!customer) return res.status(400).json({message: "Invalid request!"})

      const {status, currentTransaction} = await validateTransaction(txnId) 

    const profile = await Customer.findById(customer._id) as ICustomer;

    const orderId =  `${Math.floor(Math.random() * 89999) + 1000}`;

    const cart = <[CartItem]>req.body

    let cartItems = Array()

    let netAmount = 0.0

    let vendorId 

    const foods = await Food.find().where('_id').in(cart.map(item => item._id)).exec()

    foods.map(food => {
      cart.map(({_id, unit})=> {
        if(String(food._id) === _id){
          vendorId = food.vendorId
          netAmount += (food.price * unit)
          cartItems.push({food._id, unit})
        }
      })
    })

    if(cartItems){
      const currentOrder = await Order.create({
        orderId: orderId,
        vendorId: vendorId,
        items: cartItems,
        totalAmount: netAmount,
        paidAmount: amount,
        orderDate: new Date(),
        orderStatus: 'Waiting',
        remarks: '',
        deliveryId: '',
        readyTime: 45 
      })

      profile.cart = [] as any

      profile?.orders.push(currentOrder)

      currentTransaction.vendorId = vendorId
      currentTransaction.orderId = orderId
      currentTransaction.status = 'CONFIRMED'

      await currentTransaction.save()

      await assignOrderForDelivery(currentOrder._id, vendorId)

      const profileResponse = await profile?.save()

      return res.status(200).json(profileResponse)
    }

    return res.status(400).json({message: "Error while creating order!"})

  } catch (error) {
    return res.status(500).json({message: "Internal server Error while creating order!"})
  }
}



export const getOrderById = async (req: Request, res: Response) => {
  try {
    const orderId = req.params.id

    if(orderId){
      const order = Order.findById(orderId).populate("items.food")
      if(order){
        return res.status(2000).json(order)
      }
    }

    return res.status(400).json({message: "Order not found!"})
  } catch (error) {
    return res.status(500).json({message: "Server Error while getting order!"})
  }
}



/* ------------------- Cart Section --------------------- */
export const addToCart = async (req: Request, res: Response, next: NextFunction) => {

  const customer = req.user;
  
  if(customer){

      const profile = await Customer.findById(customer._id);
      let cartItems = Array();

      const { _id, unit } = <CartItem>req.body;

      const food = await Food.findById(_id);

      if(food){

          if(profile != null){
              cartItems = profile.cart;

              if(cartItems.length > 0){
                  // check and update
                  let existFoodItems = cartItems.filter((item) => item.food._id.toString() === _id);
                  if(existFoodItems.length > 0){
                      
                      const index = cartItems.indexOf(existFoodItems[0]);
                      
                      if(unit > 0){
                          cartItems[index] = { food, unit };
                      }else{
                          cartItems.splice(index, 1);
                      }

                  }else{
                      cartItems.push({ food, unit})
                  }

              }else{
                  // add new Item
                  cartItems.push({ food, unit });
              }

              if(cartItems){
                  profile.cart = cartItems as any;
                  const cartResult = await profile.save();
                  return res.status(200).json(cartResult.cart);
              }

          }
      }

  }

  return res.status(404).json({ msg: 'Unable to add to cart!'});
}

export const getCart = async (req: Request, res: Response, next: NextFunction) => {

    
  const customer = req.user;
  
  if(customer){
      const profile = await Customer.findById(customer._id);

      if(profile){
          return res.status(200).json(profile.cart);
      }
  
  }

  return res.status(400).json({message: 'Cart is Empty!'})

}

export const deleteCart = async (req: Request, res: Response, next: NextFunction) => {

 
  const customer = req.user;

  if(customer){

      const profile = await Customer.findById(customer._id).populate('cart.food').exec();

      if(profile != null){
          profile.cart = [] as any;
          const cartResult = await profile.save();

          return res.status(200).json(cartResult);
      }

  }

  return res.status(400).json({message: 'cart is Already Empty!'})

}



export const verifyOrder = async (req: Request, res: Response, next: NextFunction) => {

  const offerId = req.params.id;
  const customer = req.user;
  
  if(customer){

      const appliedOffer = await Offer.findById(offerId);
      
      if(appliedOffer){
          if(appliedOffer.isActive){
              return res.status(200).json({ message: 'Offer is Valid', offer: appliedOffer});
          }
      }

  }
  return res.status(400).json({ msg: 'Offer is Not Valid'});
}


export const createPayment = async (req: Request, res: Response, next: NextFunction) => {

  const customer = req.user;

  const { amount, paymentMode, offerId} = req.body;

  let payableAmount = Number(amount);

  if(offerId){

      const appliedOffer = await Offer.findById(offerId) as IOffer;

      if(appliedOffer.isActive){
          payableAmount = (payableAmount - appliedOffer.offerAmount);
      }
  }
  // perform payment gateway charge api

  // create record on transaction
  const transaction = await Transaction.create({
      customer: customer._id,
      vendorId: '',
      orderId: '',
      orderValue: payableAmount,
      offerUsed: offerId || 'NA',
      status: 'OPEN',
      paymentMode: paymentMode,
      paymentResponse: 'Payment is cash on Delivery'
  })


  //return transaction
  return res.status(200).json(transaction);

}