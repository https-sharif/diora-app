import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { parser } from '../utils/cloudinary.js';
import { likePost, getAllPost, createPost, getLikedPosts, getUserPosts, getPost, getTrendingPosts } from '../controllers/postController.js';

const router = express.Router();
router.use(verifyToken);

router.put('/like/:postId', likePost);
router.post('/create', parser.single('image'), createPost);
router.get('/trending', getTrendingPosts);
router.get('/', getAllPost);
router.get('/:postId', getPost);
router.get('/user/:userId/liked', getLikedPosts);
router.get('/user/:userId', getUserPosts);

export default router;