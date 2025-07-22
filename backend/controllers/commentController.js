import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import Notification from '../models/Notification.js';
import { getIO, onlineUsers } from '../sockets/socketSetup.js';

export const createComment = async (req, res) => {
  console.log('Create comment route/controller hit');
  console.log('Request body:', req.body);

  const { userId, postId, text } = req.body;

  if (!userId || !postId || !text) {
    return res.status(400).json({
      status: false,
      message: 'userId, postId, and text are required',
    });
  }

  try {
    const comment = new Comment({
      user: userId,
      postId,
      text,
    });

    const post = await Post.findById(postId).populate('user', 'username _id');
    if (!post) {
      return res.status(404).json({ status: false, message: 'Post not found' });
    }

    post.comments += 1;
    await post.save();

    await comment.save();
    await comment.populate('user', 'username avatar');

    if (userId !== post.user._id.toString()) {
      const notification = new Notification({
        type: 'comment',
        userId: post.user._id,
        fromUserId: userId,
        title: 'New Comment',
        postId,
        message: `${post.user.username} commented on your post`,
        actionUrl: `/post/${postId}`,
      });

      await notification.save();

      const io = getIO();
      const targetSocketId = onlineUsers.get(post.user._id.toString());
      if (targetSocketId) {
        io.to(targetSocketId).emit('notification', notification);
      }
    }

    res.status(201).json({ status: true, comment });
  } catch (error) {
    res
      .status(500)
      .json({ status: false, message: 'Error creating comment', error });
  }
};

export const createReply = async (req, res) => {
  console.log('Create reply route/controller hit');

  console.log('Replying to comment ID:', req.params.commentId);
  console.log('Request body:', req.body);
  const commentId = req.params.commentId;
  const { userId, text, targetId } = req.body;

  try {
    const parentComment = await Comment.findById(commentId);
    const post = await Post.findById(targetId);

    if (!parentComment) {
      return res
        .status(404)
        .json({ status: false, message: 'Parent comment not found' });
    }

    if (!post) {
      return res.status(404).json({ status: false, message: 'Post not found' });
    }
    console.log('Post comment found:', post);

    post.comments += 1;
    await post.save();

    const newReply = new Comment({ user: userId, text });
    await newReply.save();
    await newReply.populate('user', 'username avatar');

    parentComment.replies.push(newReply._id);
    await parentComment.save();

    return res.status(201).json({ status: true, comment: newReply });
  } catch (error) {
    res
      .status(500)
      .json({ status: false, message: 'Error creating reply', error });
  }
};

export const getComments = async (req, res) => {
  console.log('Get comments route/controller hit');
  const { postId } = req.params;

  try {
    const comments = await Comment.find({ postId })
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 })
      .populate({
        path: 'replies',
        populate: { path: 'user', select: 'username avatar' },
      });

    if (!comments || comments.length === 0) {
      return res
        .status(200)
        .json({ status: true, message: 'No comments found', comments: [] });
    }

    res.json({ status: true, comments });
  } catch (error) {
    res
      .status(500)
      .json({ status: false, message: 'Error fetching comments', error });
  }
};
