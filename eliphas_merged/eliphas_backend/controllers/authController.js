import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { sendOtpEmail } from "../utils/mailer.js";

dotenv.config();

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const maskEmail = (email) => {
  const [local, domain] = email.split("@");
  return `${local.slice(0, 2)}***@${domain}`;
};


// ─────────────────────────────────────────────
// LOGIN — Direct JWT for all roles
// ─────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json({ message: "Username and password are required" });

    const user = await User.findOne({ username });
    if (!user)
      return res.status(401).json({ message: "Invalid username or password" });

    if (!user.isVerified)
      return res.status(403).json({ message: "Account not verified. Please complete registration." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid username or password" });

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES || "7d" }
    );

    return res.json({
      message: "Login successful",
      token,
      user: { username: user.username, role: user.role }
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// ─────────────────────────────────────────────
// CREATE USER — Step A: Send OTP (Admin only)
// Roles allowed: admin, manager, user
// ─────────────────────────────────────────────
export const initiateCreateUser = async (req, res) => {
  try {
    const { username, password, role, email } = req.body;

    if (!username || !password || !role || !email)
      return res.status(400).json({ message: "Username, password, role and email are required" });

    if (!["admin", "manager", "user"].includes(role))
      return res.status(400).json({ message: "Role must be admin, manager or user" });

    const existingUsername = await User.findOne({ username });
    if (existingUsername)
      return res.status(409).json({ message: "Username already exists" });

    const existingEmail = await User.findOne({ email });
    if (existingEmail)
      return res.status(409).json({ message: "Email already in use" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();

    const tempUser = new User({
      username,
      password:     hashedPassword,
      role,
      email,
      otp,
      otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
      otpVerified:  false,
      isVerified:   false
    });
    await tempUser.save();

    await sendOtpEmail(email, otp);

    res.status(200).json({
      message: `OTP sent to ${maskEmail(email)} to verify account creation`,
      email:   maskEmail(email),
      username
    });

  } catch (error) {
    console.error("Initiate create user error:", error);
    res.status(500).json({ message: error.message });
  }
};


// ─────────────────────────────────────────────
// CREATE USER — Step B: Verify OTP → activate
// ─────────────────────────────────────────────
export const confirmCreateUser = async (req, res) => {
  try {
    const { username, otp } = req.body;

    if (!username || !otp)
      return res.status(400).json({ message: "Username and OTP are required" });

    const user = await User.findOne({ username, isVerified: false });
    if (!user || !user.otp)
      return res.status(400).json({ message: "No pending user found. Please start again." });

    if (new Date() > user.otpExpiresAt) {
      await User.deleteOne({ _id: user._id });
      return res.status(400).json({ message: "OTP expired. Please initiate creation again." });
    }

    if (user.otp !== otp.trim())
      return res.status(400).json({ message: "Incorrect OTP." });

    user.otp          = null;
    user.otpExpiresAt = null;
    user.otpVerified  = true;
    user.isVerified   = true;
    await user.save({ validateModifiedOnly: true });

    res.status(201).json({
      message: "User created and verified successfully",
      user: { username: user.username, role: user.role, email: user.email }
    });

  } catch (error) {
    console.error("Confirm create user error:", error);
    res.status(500).json({ message: error.message });
  }
};


// ─────────────────────────────────────────────
// GET ALL USERS (admin + manager)
// ─────────────────────────────────────────────
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}, { password: 0, otp: 0 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ─────────────────────────────────────────────
// EDIT USER — Admin only
// Can update username, email, role, password
// ─────────────────────────────────────────────
export const editUser = async (req, res) => {
  try {
    const requesterId   = req.user.id;
    const requesterRole = req.user.role;
    const targetId      = req.params.id;

    if (requesterRole !== "admin")
      return res.status(403).json({ message: "Only admin can edit users" });

    const targetUser = await User.findById(targetId);
    if (!targetUser)
      return res.status(404).json({ message: "User not found" });

    const { username, email, role, password } = req.body;

    // Validate role if provided
    if (role && !["admin", "manager", "user"].includes(role))
      return res.status(400).json({ message: "Role must be admin, manager or user" });

    // Check duplicate username
    if (username && username !== targetUser.username) {
      const exists = await User.findOne({ username });
      if (exists) return res.status(409).json({ message: "Username already exists" });
      targetUser.username = username;
    }

    // Check duplicate email
    if (email && email !== targetUser.email) {
      const exists = await User.findOne({ email });
      if (exists) return res.status(409).json({ message: "Email already in use" });
      targetUser.email = email;
    }

    if (role)     targetUser.role = role;
    if (password) targetUser.password = await bcrypt.hash(password, 10);

    await targetUser.save({ validateModifiedOnly: true });

    res.json({
      message: "User updated successfully",
      user: { username: targetUser.username, role: targetUser.role, email: targetUser.email }
    });

  } catch (error) {
    console.error("Edit user error:", error);
    res.status(500).json({ message: error.message });
  }
};


// ─────────────────────────────────────────────
// DELETE USER — Admin only (no manager delete)
// Admin can delete manager/user (not themselves, not other admins)
// ─────────────────────────────────────────────
export const deleteUser = async (req, res) => {
  try {
    const requesterId   = req.user.id;
    const requesterRole = req.user.role;
    const targetId      = req.params.id;

    // Only admin can delete
    if (requesterRole !== "admin")
      return res.status(403).json({ message: "Only admin can delete users" });

    if (targetId === requesterId)
      return res.status(400).json({ message: "You cannot delete your own account" });

    const targetUser = await User.findById(targetId);
    if (!targetUser)
      return res.status(404).json({ message: "User not found" });

    if (targetUser.role === "admin")
      return res.status(403).json({ message: "Admins cannot delete other admins" });

    await User.findByIdAndDelete(targetId);
    res.json({ message: `User "${targetUser.username}" deleted successfully` });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ─────────────────────────────────────────────
// SEED ADMIN (run once)
// ─────────────────────────────────────────────
export const seedAdmin = async (req, res) => {
  try {
    const existing = await User.findOne({ username: "admin" });
    if (existing)
      return res.status(409).json({ message: "Admin already exists" });

    const hashed = await bcrypt.hash("admin123", 10);
    await User.create({
      username:   "admin",
      password:   hashed,
      role:       "admin",
      email:      req.body.email || "admin@eliphas.com",
      isVerified: true
    });

    res.json({ message: "Admin created. Username: admin, Password: admin123" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
