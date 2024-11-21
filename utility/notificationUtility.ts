export const generateOtp = () => {
  const otp = Math.floor(10000 + Math.random() * 900000);
  const expiry = new Date();
  expiry.setTime(new Date().getTime() + 30 * 60 * 1000);

  return { otp, expiry };
};

export const onRequestOtp = async (otp: number, toPhoneNumber: string) => {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID as string;
    const authToken = process.env.TWILIO_AUTH_TOKEN as string;
    const client = require("twilio")(accountSid, authToken);

    const message = await client.messages.create({
      body: `Your OTP is ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER as string,
      to: toPhoneNumber,
    });
    return message;
  } catch (error) {
    console.log(error);
    return;
  }
};
