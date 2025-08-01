import User from '../models/User.js';
import mongoose from 'mongoose';

export const getAllShops = async (req, res) => {
  console.log('Get all shops route/controller hit');
  try {
    const shops = await User.find({ type: 'shop' }).populate('userId', 'username avatar');

    res.json({ status: true, shops });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const getShopById = async (req, res) => {
  console.log('Get shop by ID route/controller hit');
  try {
    const shopId = req.params.shopId;
    const shop = await User.findById(shopId)
      .populate({
        path: 'productIds',
        select: 'name price imageUrl discount stock category rating',
      });

    if (!shop) {
      return res.status(404).json({ status: false, message: 'Shop not found' });
    }

    const shopData = shop.toObject();

    if (shopData.logoUrl == '') {
      shopData.logoUrl =
        'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png';
    }
    if (shopData.coverImageUrl == '') {
      shopData.coverImageUrl =
        'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png';
    }

    res.json({ status: true, shop: shopData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const createShop = async (req, res) => {
  console.log('Create shop route/controller hit');
  try {
    const {
      name,
      username,
      description,
      logoUrl,
      coverImageUrl,
      location,
      contactEmail,
      contactPhone,
      website,
      categories,
    } = req.body;

    if (!name || !username) {
      return res.status(400).json({
        status: false,
        message: 'Name and username are required',
      });
    }

    const existingShop = await Shop.findOne({ userId: req.user.id });
    if (existingShop) {
      return res.status(400).json({
        status: false,
        message: 'User already has a shop',
      });
    }

    // Check if username is already taken
    const usernameExists = await Shop.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({
        status: false,
        message: 'Username is already taken',
      });
    }

    const newShop = new Shop({
      userId: req.user.id,
      name,
      username,
      description: description || '',
      logoUrl: logoUrl || null,
      coverImageUrl: coverImageUrl || null,
      location: location || '',
      contactEmail: contactEmail || '',
      contactPhone: contactPhone || '',
      website: website || '',
      categories: categories || [],
    });

    await newShop.save();

    res.status(201).json({ status: true, shop: newShop });
  } catch (err) {
    console.error('Create shop error:', err);

    // Handle duplicate key errors
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      return res.status(400).json({
        status: false,
        message: `${field} already exists`,
      });
    }

    // Handle validation errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({
        status: false,
        message: errors.join(', '),
      });
    }

    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const updateShop = async (req, res) => {
  console.log('Update shop route/controller hit');
  try {
    const shopId = req.params.shopId;
    const {
      name,
      username,
      description,
      logoUrl,
      coverImageUrl,
      location,
      contactEmail,
      contactPhone,
      website,
      categories,
    } = req.body;

    // Check if shop exists and belongs to user
    const existingShop = await Shop.findById(shopId);
    if (!existingShop) {
      return res.status(404).json({ status: false, message: 'Shop not found' });
    }

    if (existingShop.userId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ status: false, message: 'Not authorized to update this shop' });
    }

    // Check if username is already taken by another shop
    if (username && username !== existingShop.username) {
      const usernameExists = await Shop.findOne({
        username,
        _id: { $ne: shopId },
      });
      if (usernameExists) {
        return res.status(400).json({
          status: false,
          message: 'Username is already taken',
        });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (username) updateData.username = username;
    if (description !== undefined) updateData.description = description;
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl;
    if (coverImageUrl !== undefined) updateData.coverImageUrl = coverImageUrl;
    if (location !== undefined) updateData.location = location;
    if (contactEmail !== undefined) updateData.contactEmail = contactEmail;
    if (contactPhone !== undefined) updateData.contactPhone = contactPhone;
    if (website !== undefined) updateData.website = website;
    if (categories) updateData.categories = categories;

    const updatedShop = await Shop.findByIdAndUpdate(shopId, updateData, {
      new: true,
    });

    res.json({ status: true, shop: updatedShop });
  } catch (err) {
    console.error('Update shop error:', err);

    // Handle duplicate key errors
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      return res.status(400).json({
        status: false,
        message: `${field} already exists`,
      });
    }

    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const deleteShop = async (req, res) => {
  console.log('Delete shop route/controller hit');
  try {
    const shopId = req.params.shopId;

    // Check if shop exists and belongs to user
    const existingShop = await Shop.findById(shopId);
    if (!existingShop) {
      return res.status(404).json({ status: false, message: 'Shop not found' });
    }

    if (existingShop.userId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ status: false, message: 'Not authorized to delete this shop' });
    }

    const deletedShop = await Shop.findByIdAndDelete(shopId);

    res.json({ status: true, message: 'Shop deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const getTrendingShops = async (req, res) => {
  console.log('Get trending shops route/controller hit');
  try {
    const currentUserId = req.user.id;
    const trendingShops = await User.aggregate([
      { $match: { _id: { $ne: new mongoose.Types.ObjectId(currentUserId) }, type: 'shop' } },
      { $sample: { size: 4 } }
    ]);


    if (!trendingShops || trendingShops.length === 0) {
      return res
        .status(200)
        .json({ status: true, message: 'No trending shops found', trendingShops: [] });
    }

    res.json({ status: true, trendingShops });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const followShop = async (req, res) => {
  console.log('Follow shop route/controller hit');
  try {
    const shopId = req.params.shopId;
    const userId = req.user.id;

    if(shopId === userId) {
      return res.status(400).json({ status: false, message: 'Cannot follow your own shop' });
    }

    const shop = await User.findById(shopId);
    const user = await User.findById(userId);

    if (!shop || !user) {
      return res.status(404).json({ status: false, message: 'Shop or user not found' });
    }

    const isFollowing = user.following.includes(shopId);

    if(isFollowing) {
      user.following = user.following.pull(shopId);
      shop.followers -= 1;
    }
    else {
      user.following.push(shopId);
      shop.followers += 1;
    }

    await user.save();
    await shop.save();

    res.json({ status: true, message: `Successfully ${isFollowing ? 'unfollowed' : 'followed'} the shop`, following: user.following });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};