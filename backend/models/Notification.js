import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, enum: [ 'like', 'comment', 'follow', 'mention', 'order', 'promotion', 'system', 'warning', 'reportUpdate' ], required: true },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    avatar: { type: String },
    actionUrl: { type: String },
    data: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

export default mongoose.model('Notification', notificationSchema);