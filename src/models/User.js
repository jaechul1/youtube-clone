import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  socialOnly: { type: Boolean, default: false },
  avatarUrl: String,
  username: { type: String, required: true, unique: true },
  password: {
    type: String,
    required: function () {
      return !this.socialOnly;
    },
  },
  location: String,
});

userSchema.pre("save", async function () {
  this.password = await bcrypt.hash(this.password, 5);
});

const User = mongoose.model("User", userSchema);

export default User;
