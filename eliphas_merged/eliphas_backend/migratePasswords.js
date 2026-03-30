import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  role:     String,
  email:    String
});

const User = mongoose.model("User", userSchema);

const migrate = async () => {

  try {

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    const users = await User.find({});
    console.log(`Found ${users.length} user(s)\n`);

    for (const user of users) {

      const alreadyHashed = user.password?.startsWith("$2b$") || user.password?.startsWith("$2a$");

      if (alreadyHashed) {
        console.log(`⏭️  "${user.username}" — already hashed, skipping`);
        continue;
      }

      const hashed = await bcrypt.hash(user.password, 10);
      await User.findByIdAndUpdate(user._id, { password: hashed });
      console.log(`✅ "${user.username}" — migrated (was: "${user.password}")`);

    }

    console.log("\n🎉 Done! Try logging in now.");
    process.exit(0);

  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }

};

migrate();
