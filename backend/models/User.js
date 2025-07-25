import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  username: { type: String, required: true, unique: true, trim: true },
  fullName: { type: String, required: true, trim: true },
  password: { type: String, required: true },
  avatar: { type: String, default: null },
  bio: { type: String, default: '' },
  isVerified: { type: Boolean, default: false },
  avatarId: { type: String, default: null },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
  posts: { type: Number, default: 0 },
  likedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  type: { type: String, enum: ['user', 'shop', 'admin'], default: 'user' },
  settings: {
    theme: { type: String, enum: ['light', 'dark'], default: 'light' },
    notifications: {
      likes: { type: Boolean, default: true },
      comments: { type: Boolean, default: true },
      follow: { type: Boolean, default: true },
      mention: { type: Boolean, default: true },
      order: { type: Boolean, default: true },
      promotion: { type: Boolean, default: true },
      system: { type: Boolean, default: true },
      warning: { type: Boolean, default: true },
      reportUpdate: { type: Boolean, default: true },

      emailFrequency: { type: String, enum: ['instant', 'daily', 'weekly'], default: 'instant' },
    },
  },
});

const User = mongoose.model('User', userSchema);

export default User;
