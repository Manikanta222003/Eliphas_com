import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username:     { type: String,  required: true, unique: true },
    password:     { type: String,  required: true },
    role:         { type: String,  enum: ["admin", "manager", "user"], required: true },
    email:        { type: String,  required: true, unique: true },

    // OTP fields
    otp:          { type: String,  default: null },
    otpExpiresAt: { type: Date,    default: null },
    otpVerified:  { type: Boolean, default: false },

    // Account verified (used during 2-step creation flow)
    isVerified:   { type: Boolean, default: false }
  },
  { timestamps: true }  // adds createdAt + updatedAt automatically
);

export default mongoose.model("User", userSchema);