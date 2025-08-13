const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

// FileItem schema (embedded in User)
const fileItemSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: () => uuidv4(),
      required: true,
      unique: true,
    },
    path: {
      type: String,
      required: true,
    },
    bucket: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    publicURL: {
      type: String,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { _id: false }
);

// User schema
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
      match: /^[a-zA-Z0-9_-]+$/,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    files: {
      type: [fileItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Instance method to add file to user's files array
userSchema.methods.addFile = function (fileItem) {
  this.files.push(fileItem);
  return this.save();
};

// Instance method to remove file from user's files array
userSchema.methods.removeFile = function (fileId) {
  this.files = this.files.filter((file) => file.id !== fileId);
  return this.save();
};

// Instance method to find file by ID
userSchema.methods.findFileById = function (fileId) {
  return this.files.find((file) => file.id === fileId);
};

// Static method to find user by username
userSchema.statics.findByUsername = function (username) {
  return this.findOne({ username });
};

// Static method to create new user
userSchema.statics.createUser = function (username, passwordHash) {
  return this.create({
    username,
    passwordHash,
  });
};

module.exports = mongoose.model("User", userSchema);
