import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  role:     { type: String, enum: ["admin", "manager"], required: true },
  email:    { type: String, required: true }
});

const User = mongoose.model("User", userSchema);

// ── EDIT THESE BEFORE RUNNING ──────────────────────
const users = [
  {
    username: "admin",
    password: "admin123",
    role:     "admin",
    email:    "mkedarisetti554@gmail.com"   // ← change this
  },
  {
    username: "manager",
    password: "manager123",
    role:     "manager",
    email:    "mkedarisetti554@gmail.com" // ← change this
  }
];
// ───────────────────────────────────────────────────

const seed = async () => {

  try {

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    for (const u of users) {

      const existing = await User.findOne({ username: u.username });

      if (existing) {
        console.log(`⚠️  User "${u.username}" already exists — skipping`);
        continue;
      }

      const hashed = await bcrypt.hash(u.password, 10);
      await User.create({ username: u.username, password: hashed, role: u.role, email: u.email });
      console.log(`✅ Created ${u.role.padEnd(8)} → username: "${u.username}"  password: "${u.password}"  email: "${u.email}"`);

    }

    console.log("\n🎉 Done! Login with the credentials above.");
    console.log("   OTP will be sent to the email addresses listed.\n");
    process.exit(0);

  }
  catch (error) {
    console.error("❌ Seed failed:", error.message);
    process.exit(1);
  }

};

seed();
