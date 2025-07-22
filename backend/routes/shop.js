import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { getAllShops, getTrendingShops, getShopById, createShop, updateShop, deleteShop } from '../controllers/shopController.js';

const router = express.Router();
router.use(verifyToken);

router.get('/', getAllShops);
router.get('/trending', getTrendingShops);
router.get('/:shopId', getShopById);
router.post('/', createShop);
router.put('/:shopId', updateShop);
router.delete('/:shopId', deleteShop);

export default router;
