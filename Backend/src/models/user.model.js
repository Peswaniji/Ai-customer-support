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
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    inviteToken: { type: String, default: null },
    inviteExpiry: { type: Date, default: null },
    availabilityStatus: {
      type: String,
      enum: ["available", "busy"],
      default: "available",
    },
    refreshToken: { type: String, default: null, select: false },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (plain) {
  return bcrypt.compare(plain, this.password);
};

// FIX: Use sparse partial indexes instead of a single compound unique index.
// Problem with compound {email, businessId}: MongoDB treats multiple null businessId
// as duplicates, breaking super_admin creation.
// Solution: separate unique indexes per role-group using sparse + partialFilterExpression.

// business_admin and agent: email must be globally unique (they log into a single system)
userSchema.index(
  { email: 1 },
  {
    unique: true,
    partialFilterExpression: { role: { $in: ["business_admin", "agent", "super_admin"] } },
    name: "unique_email_staff",
  }
);

// customer: unique per (email + businessId) — same person can be customer of multiple businesses
userSchema.index(
  { email: 1, businessId: 1 },
  {
    unique: true,
    partialFilterExpression: { role: "customer" },
    name: "unique_email_customer_per_business",
  }
);

// Fast lookups
userSchema.index({ businessId: 1, role: 1 });
userSchema.index({ inviteToken: 1 }, { sparse: true });

export default mongoose.model("User", userSchema);
