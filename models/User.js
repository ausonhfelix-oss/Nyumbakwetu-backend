// models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    jina: {
      type: String,
      required: [true, "Jina linahitajika"],
      trim: true
    },
    email: {
      type: String,
      required: [true, "Email inahitajika"],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, "Password inahitajika"],
      minlength: 6
    },
    simu: {
      type: String,
      trim: true
    },
    aina: {
      type: String,
      enum: ["tenant", "landlord", "admin"],
      default: "tenant"
    },
    picha: {
      type: String,
      default: ""
    },
    mkoa: {
      type: String,
      default: ""
    },
    wilaya: {
      type: String,
      default: ""
    },
    imethibitishwa: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Kabla ya kuhifadhi, hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Kazi ya kulinganisha password
userSchema.methods.linganishaPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", userSchema);