/**
 * ONE-TIME SCRIPT: Create a user directly in MongoDB with hashed password
 *
 * Usage:
 *   node scripts/createUser.js <username> <password> <role>
 *
 * Examples:
 *   node scripts/createUser.js admin admin123 admin
 *   node scripts/createUser.js john pass456 manager
 *
 * Role must be: admin  OR  manager
 */

import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, "../.env") });

const [,, username, password, role] = process.argv;

if (!username || !password || !role) {
  console.error("\n❌  Usage: node scripts/createUser.js <username> <password> <role>");
  console.error("    Roles: admin | manager\n");
  process.exit(1);
}

if (!["admin", "manager"].includes(role)) {
  console.error("\n❌  Role must be 'admin' or 'manager'\n");
  process.exit(1);
}

const User = mongoose.model("User", new mongoose.Schema({
  username: String,
  password: String,
  role: String
}));

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const existing = await User.findOne({ username });
    if (existing) {
      console.error(`\n❌  User "${username}" already exists.\n`);
      process.exit(1);
    }

    const hashed = await bcrypt.hash(password, 10);
    await User.create({ username, password: hashed, role });

    console.log(`\n✅ User created!`);
    console.log(`   Username : ${username}`);
    console.log(`   Role     : ${role}`);
    console.log(`   Password : stored as bcrypt hash\n`);

  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
