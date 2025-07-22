import Post from '../models/Post.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { getIO, onlineUsers } from '../sockets/socketSetup.js';

export const likePost = async (req, res) => {
  console.log('Like post route/controller hit');
  try {
    const userId = req.user.id;
    const postId = req.params.postId;

    const user = await User.findById(userId);
    const post = await Post.findById(postId).populate('user', 'username');

    if (!post) {
      return res.status(404).json({ status: false, message: 'Post not found' });
    }

    const alreadyLiked = user.likedPosts.includes(postId);

    if (alreadyLiked) {
      user.likedPosts.pull(postId);
      post.stars -= 1;
    } else {
      user.likedPosts.push(postId);
      post.stars += 1;

        const notification = new Notification({
          type: 'like',
          userId: post.user._id,
          fromUserId: userId,
          postId,
          title: 'New Like',
          message: `${user.username} liked your post`,
          actionUrl: `/post/${postId}`,
        });

        await notification.save();

        const io = getIO();
        const targetSocketId = onlineUsers.get(post.user._id.toString());
        if (targetSocketId) {
          io.to(targetSocketId).emit('notification', notification);
        }
    }

    await user.save();
    await post.save();

    res.json({
      status: true,
      user: { likedPosts: user.likedPosts },
      post: { stars: post.stars },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const getAllPost = async (req, res) => {
  console.log('Get all posts route/controller hit');
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate('user', 'username avatar');

    if (!posts || posts.length === 0) {
      return res.status(404).json({ status: false, message: 'No posts found' });
    }

    res.json({ status: true, posts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  } finally {
    console.log('Get all posts request completed');
  }
};

export const createPost = async (req, res) => {
  try {
    console.log('Create post route/controller hit');
    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    const imageUrl = req.file.path;
    const newPost = new Post({
      user: req.user.id,
      imageUrl,
      caption: req.body.caption,
    });
    await newPost.save();
    user.posts += 1;
    await user.save();

    res.status(201).json({ status: true, post: newPost });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Failed to create post' });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    console.log('Get user posts route/controller hit');
    const userId = req.params.userId;
    const posts = await Post.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate('user', 'username avatar');


    if (!posts || posts.length === 0) {
      return res
        .status(204)
        .json({ status: false, message: 'No posts found for this user' });
    }

    res.json({ status: true, posts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const getLikedPosts = async (req, res) => {
  try {
    console.log('Get liked posts route/controller hit');
    const userId = req.params.userId;
    const user = await User.findById(userId);

    const likedPostIds = user?.likedPosts.map((id) => id.toString()) || [];

    const posts = await Post.find({ _id: { $in: likedPostIds } })
      .sort({ createdAt: -1 })
      .populate('user', 'username avatar');

    res.json({ status: true, posts: posts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const getPost = async (req, res) => {
  try {
    console.log('Get post route/controller hit');
    const postId = req.params.postId;
    const post = await Post.findById(postId)
      .populate('user', 'username avatar')
      .populate('comments.user', 'username avatar');

    if (!post) {
      return res.status(404).json({ status: false, message: 'Post not found' });
    }

    res.json({ status: true, post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const getTrendingPosts = async (req, res) => {
  try {
    console.log('Get trending posts route/controller hit');
    const trendingPosts = await Post.find()
      .sort({ stars: -1, createdAt: -1 })
      .limit(9)
      .populate('user', 'username avatar');

    if (!trendingPosts || trendingPosts.length === 0) {
      return res
        .status(404)
        .json({ status: false, message: 'No trending posts found' });
    }

    res.json({ status: true, trendingPosts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};
