import Product from '../models/Product.js';

export const getAllProducts = async (req, res) => {
  console.log('Get all products route/controller hit');
  try {
    const products = await Product.find().populate('shopId', 'name');
    res.json({ status: true, products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const getProductById = async (req, res) => {
  console.log('Get product by ID route/controller hit');
  try {
    const productId = req.params.productId;
    const product = await Product.findById(productId).populate('shopId', 'name');

    if (!product) {
      return res
        .status(404)
        .json({ status: false, message: 'Product not found' });
    }

    res.json({ status: true, product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const createProduct = async (req, res) => {
  console.log('Create product route/controller hit');
  try {
    const {
      shopId,
      name,
      price,
      imageUrl,
      category,
      description,
      sizes,
      variants,
      stock,
      rating,
      reviewCount,
      discount,
    } = req.body;

    const newProduct = new Product({
      shopId,
      name,
      price,
      imageUrl,
      category,
      description,
      sizes,
      variants,
      stock,
      rating: 0,
      reviewCount: 0,
      discount: discount || 0,
    });

    await newProduct.save();
    res.status(201).json({ status: true, product: newProduct });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const updateProduct = async (req, res) => {
  console.log('Update product route/controller hit');
  try {
    const productId = req.params.productId;
    const updates = req.body;

    const product = await Product.findByIdAndUpdate(productId, updates, {
      new: true,
    });

    if (!product) {
      return res
        .status(404)
        .json({ status: false, message: 'Product not found' });
    }

    res.json({ status: true, product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const deleteProduct = async (req, res) => {
  console.log('Delete product route/controller hit');
  try {
    const productId = req.params.productId;

    const product = await Product.findByIdAndDelete(productId);

    if (!product) {
      return res
        .status(404)
        .json({ status: false, message: 'Product not found' });
    }

    res.json({ status: true, message: 'Product deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const getTrendingProducts = async (req, res) => {
  console.log('Get trending products route/controller hit');
  try {
    const trendingProducts = await Product.find()
      .sort({ rating: -1, reviewCount: -1 })
      .limit(6)
      .populate('shopId', 'name');

    if (!trendingProducts || trendingProducts.length === 0) {
      return res
        .status(404)
        .json({ status: false, message: 'No trending products found' });
    }

    console.log('Trending products:', trendingProducts);

    res.json({ status: true, trendingProducts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};
