import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { createComment, getComments, createReply } from '../controllers/commentController.js';

const router = express.Router();
router.use(verifyToken);

router.post('/create', createComment);
router.post('/reply/:commentId', createReply);
router.get('/post/:postId', getComments);

export default router;