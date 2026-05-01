import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      // unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: ["super_admin", "business_admin", "agent", "customer"],
      required: true,
    },
    // null for super_admin, required for everyone else
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // agent invite flow
    inviteToken:  { type: String, default: null },
    inviteExpiry: { type: Date,   default: null },
    // agent availability
    availabilityStatus: {
      type: String,
      enum: ["available", "busy"],
      default: "available",
    },
    refreshToken: { type: String, default: null, select: false },
  },
  { timestamps: true }
);

// hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.index({ email: 1 });
userSchema.index({ businessId: 1, role: 1 });

export default mongoose.model("User", userSchema);