import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use STARTTLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Verify connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("📧 Mail Server Error:", error.message);
  } else {
    console.log("📧 Mail Server is ready to send messages");
  }
});

export const sendPaymentReminder = async (to, { memberName, lastPaidAt, endAt, amount, gymName }) => {
  const mailOptions = {
    from: `"SMART GYM - ${gymName}" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Payment Reminder",
    text: `Hi ${memberName},

This is a formal reminder regarding your gym payment.

Details:
- Name: ${memberName}
- Last Payment Date: ${new Date(lastPaidAt).toLocaleDateString()}
- Expiration Date: ${new Date(endAt).toLocaleDateString()}
- Payment Amount: ${amount} LKR

Please ensure your subscription is renewed to continue enjoying our facilities.

Best regards,
${gymName}`,
    html: `
      <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <h2 style="color: #007bff; text-align: center;">Subscription Reminder</h2>
        <p>Hi <strong>${memberName}</strong>,</p>
        <p>This is a formal reminder regarding your gym membership subscription.</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Name:</strong> ${memberName}</p>
          <p style="margin: 5px 0;"><strong>Last Payment Date:</strong> ${new Date(lastPaidAt).toLocaleDateString()}</p>
          <p style="margin: 5px 0;"><strong>Expiration Date:</strong> <span style="color: #dc3545;">${new Date(endAt).toLocaleDateString()}</span></p>
          <p style="margin: 5px 0;"><strong>Payment Amount:</strong> ${amount} LKR</p>
        </div>
        <p>Please ensure your subscription is renewed to continue enjoying our facilities.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #777; text-align: center;">Best regards,<br>${gymName}</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

export const sendChurnEncouragement = async (to, { memberName, gymName }) => {
  const mailOptions = {
    from: `"${gymName} Team" <${process.env.EMAIL_USER}>`,
    to,
    subject: `We miss you at ${gymName}!`,
    text: `Hi ${memberName},

We noticed you haven't been at the gym for a while. We miss seeing you on the floor!

Consistency is the key to reaching your fitness goals. Whether you're busy or just need a little extra motivation, we're here to help you get back on track.

Come by today for a workout! We'd love to see you again.

Best regards,
The ${gymName} Team`,
    html: `
      <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <h2 style="color: #007bff; text-align: center;">We Miss You!</h2>
        <p>Hi <strong>${memberName}</strong>,</p>
        <p>We noticed you haven't been at the gym for a while. We miss seeing you on the floor!</p>
        <div style="background-color: #f1f8ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff;">
          <p style="margin: 0; font-style: italic;">"Motivation is what gets you started. Habit is what keeps you going."</p>
        </div>
        <p>Consistency is the key to reaching your fitness goals. Whether you're busy or just need a little extra motivation, we're here to help you get back on track.</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="#" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">See You Soon!</a>
        </p>
        <p>Come by today for a workout! We'd love to see you again.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #777; text-align: center;">Best regards,<br>The ${gymName} Team</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

export const sendPasswordReset = async (to, { otp }) => {
  const mailOptions = {
    from: `"Gym Management System" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Password Reset OTP",
    text: `Your password reset OTP is: ${otp}\n\nIt is valid for 10 minutes.`,
    html: `
      <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <h2 style="color: #007bff; text-align: center;">Password Reset</h2>
        <p>You have requested to reset your password. Use the OTP below to proceed:</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <h1 style="margin: 0; letter-spacing: 5px; color: #333;">${otp}</h1>
        </div>
        <p>This OTP is valid for <strong>10 minutes</strong>. If you did not request this, please ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #777; text-align: center;">Gym Management System</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};
