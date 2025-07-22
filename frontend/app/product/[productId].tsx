import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Share, Star, ShoppingCart, Store, Plus, Minus, Bookmark } from 'lucide-react-native';
import { useShopping } from '@/hooks/useShopping';
import { useAuth } from '@/hooks/useAuth';
import { mockProducts } from '@/mock/Product';
import { mockReviews } from '@/mock/Review';
import { mockUsers } from '@/mock/User';
import { mockShops } from '@/mock/Shop';
import { ShopProfile } from '@/types/ShopProfile';
import { Product } from '@/types/Product';
import { Review } from '@/types/Review';
import { Theme } from '@/types/Theme';
import { useTheme } from '@/contexts/ThemeContext';
import ProductSlashIcon from '@/icon/ProductSlashIcon'
import axios from 'axios';
import { API_URL } from '@/constants/api';

const { width } = Dimensions.get('window')

const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      paddingTop: -59,
      paddingBottom: -34,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    headerTitle: {
      fontSize: 18,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
    },
    headerButton: {
      padding: 8,
    },
    headerActions: {
      flexDirection: 'row',
      gap: 8,
    },
    content: {
      flex: 1,
    },
    imageContainer: {
      width: '100%',
      height: width,
      aspectRatio: 1,
      backgroundColor: theme.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
    },
    mainImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'contain',
    },
    thumbnailContainer: {
      backgroundColor: theme.card,
    },
    thumbnailContent: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 8,
    },
    thumbnailImage: {
      width: 60,
      height: 60,
      borderRadius: 8,
    },
    productInfo: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    productBrand: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
      color: theme.textSecondary,
      marginBottom: 4,
    },
    productName: {
      fontSize: 24,
      fontFamily: 'Inter-Bold',
      color: theme.text,
      marginBottom: 8,
    },
    priceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    originalPrice: {
      fontSize: 20,
      fontFamily: 'Inter-Bold',
      color: theme.textSecondary,
      marginBottom: 12,
      textDecorationLine: 'line-through',
    },
    productPrice: {
      fontSize: 28,
      fontFamily: 'Inter-Bold',
      color: theme.text,
      marginBottom: 12,
    },
    ratingContainer: {
      marginBottom: 16,
    },
    rating: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    ratingText: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
      color: theme.textSecondary,
    },
    productDescription: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: theme.text,
      lineHeight: 24,
    },
    storeSection: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    sectionTitle: {
      fontSize: 18,
      fontFamily: 'Inter-Bold',
      color: theme.text,
      marginBottom: 16,
    },
    storeInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    storeAvatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
    },
    storeDetails: {
      flex: 1,
      marginLeft: 12,
    },
    storeName: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
      marginBottom: 4,
    },
    storeStats: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    storeRating: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    storeRatingText: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
      color: theme.textSecondary,
    },
    storeFollowers: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
    },
    visitStoreButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.accent,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 8,
      gap: 4,
    },
    visitStoreText: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
      color: '#000',
    },
    optionSection: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    optionTitle: {
      fontSize: 18,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
      marginBottom: 12,
    },
    optionButtons: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    optionButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.card,
    },
    optionButtonActive: {
      backgroundColor: theme.accentSecondary,
      borderColor: theme.accentSecondary,
    },
    optionButtonText: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
      color: theme.textSecondary,
    },
    optionButtonTextActive: {
      color: '#000',
    },
    quantitySection: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    quantityControls: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    quantityButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.accentSecondary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    quantityButtonDisabled: {
      opacity: 0.5,
    },
    quantityText: {
      fontSize: 20,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
      minWidth: 30,
      textAlign: 'center',
    },
    reviewsSection: {
      padding: 16,
    },
    reviewItem: {
      marginBottom: 16,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    reviewHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    reviewAvatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
    },
    reviewInfo: {
      marginLeft: 12,
    },
    reviewUser: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
      marginBottom: 2,
    },
    reviewRating: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    reviewDate: {
      fontSize: 12,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
    },
    reviewComment: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: theme.text,
      lineHeight: 20,
    },
    bottomPadding: {
      height: 34,
    },
    footer: {
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: theme.border,
      backgroundColor: theme.background,
    },
    addToCartButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.accent,
      borderRadius: 12,
      paddingVertical: 16,
      gap: 8,
    },
    addToCartButtonDisabled: {
      opacity: 0.5,
    },
    addToCartButtonDisabledText: {
      color: theme.text,
    },
    addToCartText: {
      color: '#000',
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    emptyIconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.card,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
    },
    errorText: {
      fontSize: 18,
      fontFamily: 'Inter-SemiBold',
      color: theme.textSecondary,
      marginBottom: 20,
    },
    backButton: {
      backgroundColor: theme.accent,
      borderRadius: 12,
      paddingHorizontal: 24,
      paddingVertical: 12,
    },
    backButtonText: {
      color: '#000',
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
    },
  });
}

export default function ProductDetailScreen() {
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useShopping();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { token } = useAuth();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState<ShopProfile | null>(null);
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}/api/product/${productId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if(!response.data.status) {
          Alert.alert('Error', response.data.message);
          return;
        }

        setProduct(response.data.product);
        setStore(response.data.product.shopId);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  useEffect(() => {
    if (product && selectedImageIndex >= product.imageUrl.length) {
      setSelectedImageIndex(0);
    }
  }, [selectedImageIndex]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading product...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <View style={styles.emptyIconContainer}>
            <ProductSlashIcon size={40} />
          </View>
          <Text style={styles.errorText}>Product not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      Alert.alert('Please select size and color');
      return;
    }
    
    for (let i = 0; i < quantity; i++) {
      addToCart(product, selectedSize, selectedColor);
    }
    Alert.alert('Success', `${quantity} item(s) added to cart!`);
  };

  const renderImageItem = ({ item, index }: { item: string; index: number }) => (
    <TouchableOpacity onPress={() => setSelectedImageIndex(index)}>
      <Image source={{ uri: item }} style={styles.thumbnailImage} />
    </TouchableOpacity>
  );

  const renderReview = ({ item }: { item: Review }) => {
    const user = mockUsers.find(user => user._id === item.userId);
    return (
    <View style={styles.reviewItem}>
      <View style={styles.reviewHeader}>
        <Image source={{ uri: user?.avatar }} style={styles.reviewAvatar} />
        <View style={styles.reviewInfo}>
          <Text style={styles.reviewUser}>{user?.username}</Text>
          <View style={styles.reviewRating}>
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                color={i < item.rating ? '#FFD700' : '#E0E0E0'}
                fill={i < item.rating ? '#FFD700' : 'transparent'}
              />
            ))}
            <Text style={styles.reviewDate}>{item.createdAt}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.reviewComment}>{item.comment}</Text>
    </View>
  );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{product.name}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Share size={24} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => addToWishlist(product)}
          >
            <Bookmark
              size={24}
              color={theme.text}
              fill={isInWishlist(product._id) ? theme.text : 'transparent'}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: product.imageUrl[selectedImageIndex] }}
            style={styles.mainImage}
            resizeMode="contain"
          />
        </View>           


        {/* Image Thumbnails */}
        <FlatList
          data={product.imageUrl}
          renderItem={renderImageItem}
          keyExtractor={(item, index) => index.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.thumbnailContainer}
          contentContainerStyle={styles.thumbnailContent}
        />

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productBrand}>{product.shopId.name}</Text>
          <Text style={styles.productName}>{product.name}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.productPrice}>${(product.discount && product.discount > 0 ? (product.price * (1 - product.discount / 100)).toFixed(2) : product.price)}</Text>
            {product.discount && product.discount > 0 && (
              <Text style={styles.originalPrice}>${product.price}</Text>
            )}
          </View>
          <View style={styles.ratingContainer}>
            <View style={styles.rating}>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  color={i < Math.floor(product.rating) ? '#FFD700' : theme.textSecondary}
                  fill={i < Math.floor(product.rating) ? '#FFD700' : 'transparent'}
                />
              ))}
              <Text style={styles.ratingText}>{(product.rating / (product.reviewCount || 1)).toFixed(1)} ({product.reviewCount} reviews)</Text>
            </View>
          </View>

          <Text style={styles.productDescription}>{product.description}</Text>
        </View>

        {/* Store Info */}
        <View style={styles.storeSection}>
          <Text style={styles.sectionTitle}>Store</Text>
          <View style={styles.storeInfo}>
            <Image source={{ uri: store?.logoUrl }} style={styles.storeAvatar} />
            <View style={styles.storeDetails}>
              <Text style={styles.storeName}>{store?.name}</Text>
              <View style={styles.storeStats}>
                <View style={styles.storeRating}>
                  <Star size={14} color="#FFD700" fill="#FFD700" />
                  <Text style={styles.storeRatingText}>{store?.rating}</Text>
                </View>
                <Text style={styles.storeFollowers}>{store?.followers} followers</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.visitStoreButton} onPress={() => router.push(`/shop/${store?._id}`)}>
              <Store size={16} color="#000" />
              <Text style={styles.visitStoreText}>Visit</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Size Selection */}
        <View style={styles.optionSection}>
          <Text style={styles.optionTitle}>Size</Text>
          <View style={styles.optionButtons}>
            {product.sizes.map((size: string) => (
              <TouchableOpacity
                key={size}
                style={[
                  styles.optionButton,
                  selectedSize === size && styles.optionButtonActive
                ]}
                onPress={() => setSelectedSize(size)}
              >
                <Text style={[
                  styles.optionButtonText,
                  selectedSize === size && styles.optionButtonTextActive
                ]}>
                  {size}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Color Selection */}
        <View style={styles.optionSection}>
          <Text style={styles.optionTitle}>Color</Text>
          <View style={styles.optionButtons}>
            {product.variants.map((color: string) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.optionButton,
                  selectedColor === color && styles.optionButtonActive
                ]}
                onPress={() => setSelectedColor(color)}
              >
                <Text style={[
                  styles.optionButtonText,
                  selectedColor === color && styles.optionButtonTextActive
                ]}>
                  {color}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quantity */}
        <View style={styles.quantitySection}>
          <Text style={styles.optionTitle}>Quantity</Text>
          <View style={styles.quantityControls}>
            <TouchableOpacity 
              style={[styles.quantityButton, (!product.stock || quantity <= 1) && styles.quantityButtonDisabled]}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={!product.stock || quantity <= 1}
            >
              <Minus size={20} color="#000" />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity 
              style={[styles.quantityButton, (!product.stock || quantity >= product.stock) && styles.quantityButtonDisabled]}
              onPress={() => setQuantity(Math.min(product.stock, quantity + 1))}
              disabled={!product.stock || quantity >= product.stock}
            >
              <Plus size={20} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Reviews */}
        <View style={styles.reviewsSection}>
          <Text style={styles.sectionTitle}>Reviews ({reviews.length})</Text>
          <FlatList
            data={reviews}
            renderItem={renderReview}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Add to Cart Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={[styles.addToCartButton, !product.stock && styles.addToCartButtonDisabled]} onPress={handleAddToCart} disabled={!product.stock}>
          {product.stock ? <ShoppingCart size={20} color="#000" /> : null}
          <Text style={[styles.addToCartText, !product.stock && styles.addToCartButtonDisabledText]}>{!product.stock ? 'Out of Stock' : 'Add to Cart'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}