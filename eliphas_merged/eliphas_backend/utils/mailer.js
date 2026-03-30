import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendOtpEmail = async (email, otp) => {
  const mailOptions = {
    from:    `"Eliphas App" <${process.env.EMAIL_USER}>`,
    to:      email,
    subject: "Your OTP Code — Eliphas",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 32px; max-width: 480px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #1a1a2e; margin-top: 0;">Eliphas — Account Verification</h2>
        <p style="color: #555;">Use the OTP below to verify your account. It expires in <b>10 minutes</b>.</p>
        <div style="text-align: center; margin: 28px 0;">
          <span style="font-size: 36px; font-weight: 700; letter-spacing: 12px; color: #4F46E5;">${otp}</span>
        </div>
        <p style="color: #aaa; font-size: 12px;">If you did not request this, please ignore this email.</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};
