const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: validator.isEmail,
        message: "Please provide a valid email address"
      }
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false
    },
    role: {
      type: String,
      enum: ["SUPER_ADMIN", "COORDINATOR", "STUDENT"],
      required: true
    },
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      default: null
    },
    isActive: {
      type: Boolean,
      default: true
    },
    college: {
      type: String,
      enum: ["City College", "BMS College", "GIMS College", "St Pheleomena"],
      required: false // Or true depending on if it's strictly required, the prompt implies "another column to select their college". We'll make it required if the role is STUDENT, but since it's a general user schema, let's keep it optional globally and validate in the controller.
    }
  },
  { timestamps: true }
);

userSchema.pre("save", async function savePassword(next) {
  if (!this.isModified("password")) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.index({ role: 1, businessId: 1, isActive: 1 });

module.exports = mongoose.model("User", userSchema);
