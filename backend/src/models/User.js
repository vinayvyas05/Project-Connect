import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

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
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
    },

    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Pre-save hook
 * - hashes password before saving when password field is created/modified
 */
userSchema.pre('save', async function (next) {
  // `this` is the document being saved
  if (!this.isModified('password')) return next();

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
  delete obj.refreshToken; // Exclude refreshToken from JSON responses as well for security
  delete obj.__v;
  return obj;
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      userId: this._id, // Add userId for backward compatibility with existing controllers/middlewares
      email: this.email,
      name: this.name,
      username: this.username || this.name,
      fullName: this.fullName || this.name,
    },
    process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '1d',
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '10d',
    }
  );
};

export default model('User', userSchema);
