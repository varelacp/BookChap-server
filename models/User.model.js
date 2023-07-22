const {Schema, model} = require('mongoose');

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required']
    },
    profileImage: {
      type: String
    },
    address: {
      type: String
    },
    phoneNumber: {
      type: String
    },
    email: {
      type: String,
      required: [true, 'Email is required.'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      enum: ['user', 'admin'],
      default: 'user'
    }
  },
  {
    timestamps: true
  }
);

module.exports = model('User', userSchema);
