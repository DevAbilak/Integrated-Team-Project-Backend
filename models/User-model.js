const mongoose = require("mongoose");

const UserSchema = mongoose.Schema(
  {
    email: {
      type: String,
      trim: true,
      require: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    emailVerified: { type: Boolean, default: false },
    lastLogin: { type: Date, default: Date.now() },
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verificationToken: String,
    verificationExpiresAt: Date,
    role: {
      type: String,
      enum: ["traveler", "operator", "admin"],
      default: "traveler",
    },
    pointsBalance: { type: Number, default: 0, min: 0 },
    referralCode: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      uppercase: true,
    },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    operatorDetails: {
      businessName: { type: String, trim: true },
      licenseNumber: { type: String, trim: true },
      verified: { type: Boolean, default: false },
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

//Remove operatorDetails for non‑operator users
UserSchema.pre("save", function () {
  if (this.role !== "operator") {
    this.operatorDetails = undefined;
  }
  // next();
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
