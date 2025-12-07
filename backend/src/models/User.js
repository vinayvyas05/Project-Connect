import mongoose from "mongoose";
import bcrypt from "bcrypt";

const { Schema, model } = mongoose;

/**
 * User schema
 * - stores basic user profile + hashed password
 * - timestamps: createdAt / updatedAt
 */
const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },

    password: {
      type: String,
      required: true,
      minlength: 8
    }
  },
  {
    timestamps: true
  }
);

/**
 * Pre-save hook
 * - hashes password before saving when password field is created/modified
 */
userSchema.pre("save", async function (next) {
  // `this` is the document being saved
  if (!this.isModified("password")) return next();

  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
  try {
    const salt = await bcrypt.genSalt(saltRounds);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

/**
 * Instance method: comparePassword
 * - compares a plain text candidate password with the stored hash
 * - returns boolean
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * toJSON override
 * - remove sensitive fields (password, __v) when sending document to client
 */
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

export default model("User", userSchema);
