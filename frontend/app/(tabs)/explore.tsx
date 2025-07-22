import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Modal,
  Dimensions,
  Animated,
  PanResponder,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Search,
  Filter,
  X,
  Check,
  Star,
  MessageCircle,
  Store,
  Bookmark,
  SearchX,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { useShopping } from '@/hooks/useShopping';
import { useTheme } from '@/contexts/ThemeContext';
import Color from 'color';
import { User } from '@/types/User';
import { ShopProfile } from '@/types/ShopProfile';
import { Product } from '@/types/Product';
import { Post } from '@/types/Post';
import { Theme } from '@/types/Theme';
import { mockUsers } from '@/mock/User';
import { mockShops } from '@/mock/Shop';
import { mockProducts } from '@/mock/Product';
import { useAuth } from '@/hooks/useAuth';
import axios from 'axios';
import { API_URL } from '@/constants/api';
import LoadingView from '@/components/Loading';

const { width, height } = Dimensions.get('window');

const filterOptions = {
  contentType: ['All', 'Users', 'Shops', 'Products', 'Posts'],
  priceRange: ['All', '$0-$50', '$50-$100', '$100-$200', '$200+'],
  rating: ['All', '4+ Stars', '4.5+ Stars', '4.8+ Stars'],
  availability: ['All', 'In Stock', 'On Sale', 'New Arrivals'],
  style: [
    'All',
    'Vintage',
    'Modern',
    'Casual',
    'Formal',
    'Streetwear',
    'Boho',
    'Minimalist',
  ],
  verification: ['All', 'Verified Only', 'Unverified'],
  followers: ['All', '0-1K', '1K-10K', '10K-50K', '50K+'],
  likes: ['All', '0-100', '100-500', '500-1000', '1000+'],
};

const createStyles = (theme: Theme) => {
  const outOfStockOverlay = Color(theme.text).alpha(0.5).toString();
  const bookmarkInactiveColor = Color(theme.text).alpha(0.5).toString();

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      paddingTop: -100,
      paddingBottom: -100,
    },
    header: {
      paddingHorizontal: 16,
      paddingVertical: 16,
      backgroundColor: theme.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.background,
    },
    title: {
      fontSize: 28,
      fontFamily: 'Inter-Bold',
      color: theme.text,
      marginBottom: 16,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.card,
      borderRadius: 12,
      paddingHorizontal: 12,
      height: 44,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: theme.text,
    },
    filterButton: {
      padding: 4,
    },
    content: {
      flex: 1,
    },
    section: {
      paddingVertical: 20,
    },
    sectionTitle: {
      fontSize: 22,
      fontFamily: 'Inter-Bold',
      color: theme.text,
      marginBottom: 16,
      paddingHorizontal: 16,
    },
    userCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 16,
      marginHorizontal: 16,
      marginBottom: 12,
      shadowColor: theme.text,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 8,
    },
    userAvatar: {
      width: 60,
      height: 60,
      borderRadius: 30,
    },
    userInfo: {
      flex: 1,
      marginLeft: 12,
    },
    userNameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    userName: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
    },
    verifiedBadgeContainer: {
      width: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: '#007AFF',
      justifyContent: 'center',
      alignItems: 'center',
    },
    userFullName: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
      marginTop: 4,
      lineHeight: 18,
    },
    userLocation: {
      fontSize: 12,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
      marginTop: 4,
    },
    userFollowers: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
      color: theme.textSecondary,
      marginTop: 4,
    },
    followButton: {
      backgroundColor: theme.text,
      borderRadius: 20,
      paddingHorizontal: 20,
      paddingVertical: 8,
    },
    followButtonText: {
      color: theme.background,
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
    },
    followingButton: {
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
    },
    followingButtonText: {
      color: theme.text,
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
    },
    productsContainer: {
      paddingHorizontal: 16,
      gap: 12,
    },
    productCard: {
      width: '48%',
      backgroundColor: theme.card,
      borderRadius: 16,
      overflow: 'hidden',
      shadowColor: theme.text,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      marginBottom: 12,
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 8,
    },
    productImageContainer: {
      position: 'relative',
    },
    productImage: {
      width: '100%',
      height: 160,
    },
    discountBadge: {
      position: 'absolute',
      top: 8,
      left: 8,
      backgroundColor: '#FF3B30',
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 4,
      zIndex: 10,
    },
    discountText: {
      color: '#fff',
      fontSize: 12,
      fontFamily: 'Inter-Bold',
    },
    outOfStockOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: outOfStockOverlay,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 5,
    },
    outOfStockText: {
      color: theme.background,
      fontSize: 20,
      fontFamily: 'Inter-Bold',
    },
    wishlistButton: {
      position: 'absolute',
      top: 8,
      right: 8,
      backgroundColor: bookmarkInactiveColor,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 8,
      zIndex: 15,
    },
    wishlistButtonActive: {
      backgroundColor: theme.text,
    },
    productInfo: {
      padding: 12,
    },
    shopInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
      gap: 6,
    },
    shopAvatar: {
      width: 20,
      height: 20,
      borderRadius: 10,
    },
    shopName: {
      fontSize: 12,
      fontFamily: 'Inter-Medium',
      color: theme.textSecondary,
    },
    productName: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
      marginBottom: 6,
      lineHeight: 18,
    },
    priceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 4,
    },
    productPrice: {
      fontSize: 16,
      fontFamily: 'Inter-Bold',
      color: theme.text,
    },
    originalPrice: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
      textDecorationLine: 'line-through',
    },
    ratingRow: {
      flexDirection: 'row',
      gap: 4,
      position: 'absolute',
      bottom: 16,
      right: 16,
    },
    ratingText: {
      fontSize: 12,
      fontFamily: 'Inter-Medium',
      color: theme.textSecondary,
    },
    gridRow: {
      paddingHorizontal: 16,
      width: '99%',
    },
    gridRowProduct: {
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      width: '100%',
    },
    gridItem: {
      width: '33%',
      aspectRatio: 1,
      borderWidth: 1,
      borderColor: theme.background,
      overflow: 'hidden',
      position: 'relative',
    },
    gridImage: {
      width: '100%',
      height: '100%',
      backgroundColor: theme.card,
    },
    noResults: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    noResultsIconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.card,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
    },
    noResultsText: {
      fontSize: 18,
      fontFamily: 'Inter-SemiBold',
      color: theme.textSecondary,
      marginBottom: 8,
    },
    noResultsSubtext: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
    },
    bottomPadding: {
      height: 100,
    },
    filterModal: {
      flex: 1,
      backgroundColor: theme.card,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingBottom: 20,
      overflow: 'hidden',
    },
    filterHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    filterHeaderTitle: {
      fontSize: 20,
      fontFamily: 'Inter-Bold',
      color: theme.text,
    },
    filterContent: {
      flex: 1,
      padding: 16,
    },
    filterSection: {
      marginBottom: 32,
    },
    filterTitle: {
      fontSize: 18,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
      marginBottom: 16,
    },
    filterOptions: {
      flexDirection: 'row',
      gap: 8,
    },
    filterOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 25,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.background,
      gap: 6,
    },
    filterOptionActive: {
      backgroundColor: theme.accent,
      borderColor: theme.accent,
    },
    filterOptionText: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
      color: theme.text,
    },
    filterOptionTextActive: {
      color: '#000',
    },
    filterCheck: {
      marginLeft: 4,
    },
    filterFooter: {
      flexDirection: 'row',
      padding: 16,
      gap: 12,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    clearFiltersButton: {
      flex: 1,
      backgroundColor: '#f8f9fa',
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border,
    },
    clearFiltersText: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: '#000',
    },
    applyFiltersText: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: '#fff',
    },
    applyFiltersButton: {
      flex: 1,
      backgroundColor: '#000',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
    },
    enlargedContainer: {
      flex: 1,
      backgroundColor: 'rgba(255, 255, 255, 0.05)',

      justifyContent: 'center',
      alignItems: 'center',
    },
    enlargedBackdrop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    enlargedContent: {
      width: width * 0.9,
      maxHeight: height * 0.8,
      backgroundColor: 'rgba(55, 55, 55, 0.8)',
      borderRadius: 20,
      overflow: 'hidden',
    },
    enlargedHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
    },
    enlargedUserInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    enlargedUserAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
    },
    enlargedUsername: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: '#fff',
    },
    enlargedTimestamp: {
      fontSize: 12,
      fontFamily: 'Inter-Regular',
      color: '#ccc',
    },
    enlargedImage: {
      width: '100%',
      height: width * 0.9,
      resizeMode: 'contain',
    },
    enlargedFooter: {
      padding: 16,
    },
    enlargedActions: {
      flexDirection: 'row',
      gap: 20,
      marginBottom: 12,
    },
    enlargedStat: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    enlargedStatText: {
      color: '#fff',
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
    },
    enlargedCaption: {
      color: '#fff',
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      lineHeight: 22,
      marginBottom: 12,
    },
    enlargedTags: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    enlargedTag: {
      color: theme.textSecondary,
      fontSize: 14,
      fontFamily: 'Inter-Medium',
    },
  });
};

export default function ExploreScreen() {
  const { addToWishlist, isInWishlist } = useShopping();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [enlargedPost, setEnlargedPost] = useState<Post | null>(null);
  const [scaleAnim] = useState(new Animated.Value(1));
  const [opacityAnim] = useState(new Animated.Value(0));
  const { user, followUser, likePost, token } = useAuth();
  const { theme } = useTheme();

  const [exploreData, setExploreData] = useState({
    trendingUsers: [] as User[],
    trendingShops: mockShops.slice(0, 4) as ShopProfile[],
    trendingProducts: [] as Product[],
    trendingPosts: [] as Post[],
  });

  const [loading, setLoading] = useState({
    trendingUsers: false,
    trendingShops: false,
    trendingProducts: false,
    trendingPosts: false,
  });

  const styles = createStyles(theme);
  const isLiked = user?.likedPosts?.includes(enlargedPost?._id || '');

  useEffect(() => {
    if (!user) return;

    const fetchTrendingUser = async () => {
      setLoading((prevState) => ({ ...prevState, trendingUsers: true }));

      try {
        const response = await axios.get(`${API_URL}/api/user/trending`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.status) {
          setExploreData((prevState) => ({
            ...prevState,
            trendingUsers: response.data.trendingUsers,
          }));
        }
      } catch (err: any) {
        console.error(
          'Error fetching trending user data: ',
          err.response?.data || err.message
        );
      } finally {
        setLoading((prevState) => ({ ...prevState, trendingUsers: false }));
      }
    };

    const fetchTrendingShops = async () => {
      setLoading((prevState) => ({ ...prevState, trendingShops: true }));

      try {
        const response = await axios.get(`${API_URL}/api/shop/trending`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.status) {
          setExploreData((prevState) => ({
            ...prevState,
            trendingShops: response.data.trendingShops,
          }));
        }
      } catch (err: any) {
        console.error(
          'Error fetching trending shops data: ',
          err.response?.data || err.message
        );
      } finally {
        setLoading((prevState) => ({ ...prevState, trendingShops: false }));
      }
    };

    const fetchTrendingProducts = async () => {
      setLoading((prevState) => ({ ...prevState, trendingProducts: true }));

      try {
        const response = await axios.get(`${API_URL}/api/product/trending`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.status) {
          setExploreData((prevState) => ({
            ...prevState,
            trendingProducts: response.data.trendingProducts,
          }));
        }
      } catch (err: any) {
        console.error(
          'Error fetching trending products data: ',
          err.response?.data || err.message
        );
      } finally {
        setLoading((prevState) => ({ ...prevState, trendingProducts: false }));
      }
    };

    const fetchTrendingPosts = async () => {
      setLoading((prevState) => ({ ...prevState, trendingPosts: true }));

      try {
        const response = await axios.get(`${API_URL}/api/post/trending`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.status) {
          setExploreData((prevState) => ({
            ...prevState,
            trendingPosts: response.data.trendingPosts,
          }));
        }
      } catch (err: any) {
        console.error(
          'Error fetching trending posts data: ',
          err.response?.data || err.message
        );
      } finally {
        setLoading((prevState) => ({ ...prevState, trendingPosts: false }));
      }
    };

    fetchTrendingUser();
    fetchTrendingShops();
    fetchTrendingProducts();
    fetchTrendingPosts();
  }, []);

  const [filters, setFilters] = useState({
    contentType: 'All',
    priceRange: 'All',
    rating: 'All',
    availability: 'All',
    style: 'All',
    location: 'All',
    verification: 'All',
    followers: 'All',
    likes: 'All',
  });

  const applyFilters = () => {
    let filteredUsers = exploreData.trendingUsers;
    let filteredShops = exploreData.trendingShops;
    let filteredProducts = exploreData.trendingProducts;
    let filteredPosts = exploreData.trendingPosts;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredUsers = filteredUsers.filter(
        (user) =>
          user.username.toLowerCase().includes(query) ||
          user.fullName.toLowerCase().includes(query)
      );
      filteredShops = filteredShops.filter((user) =>
        user.username.toLowerCase().includes(query)
      );
      filteredProducts = filteredProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.shopId.name.toLowerCase().includes(query)
      );
      filteredPosts = filteredPosts.filter((post) =>
        post.caption?.toLowerCase().includes(query)
      );
    }

    // Apply advanced filters
    if (filters.contentType !== 'All') {
      if (filters.contentType === 'Users') {
        filteredProducts = [];
        filteredPosts = [];
        filteredShops = [];
      } else if (filters.contentType === 'Shops') {
        filteredUsers = [];
        filteredProducts = [];
        filteredPosts = [];
      } else if (filters.contentType === 'Products') {
        filteredUsers = [];
        filteredPosts = [];
        filteredShops = [];
      } else if (filters.contentType === 'Posts') {
        filteredUsers = [];
        filteredShops = [];
        filteredProducts = [];
      }
    }

    // Price range filter for products
    if (filters.priceRange !== 'All' && filteredProducts.length > 0) {
      filteredProducts = filteredProducts.filter((product) => {
        const price = product.price;
        switch (filters.priceRange) {
          case '$0-$50':
            return price <= 50;
          case '$50-$100':
            return price > 50 && price <= 100;
          case '$100-$200':
            return price > 100 && price <= 200;
          case '$200+':
            return price > 200;
          default:
            return true;
        }
      });
    }

    // Rating filter
    if (filters.rating !== 'All') {
      const minRating = parseFloat(filters.rating.split('+')[0]);
      filteredProducts = filteredProducts.filter(
        (product) => product.rating >= minRating
      );
    }

    // Availability filter
    if (filters.availability !== 'All') {
      filteredProducts = filteredProducts.filter((product) => {
        switch (filters.availability) {
          case 'In Stock':
            return product.stock > 0;
          case 'On Sale':
            if (!product.discount) return false;
            return product.discount > 0;
          case 'New Arrivals':
            return true;
          default:
            return true;
        }
      });
    }

    if (filters.style !== 'All') {
      const style = filters.style.toLowerCase();
      filteredProducts = filteredProducts.filter((product) =>
        product.name.toLowerCase().includes(style)
      );
      filteredPosts = filteredPosts.filter((post) =>
        post.caption?.toLowerCase().includes(style)
      );
    }

    if (filters.verification !== 'All') {
      if (filters.verification === 'Verified Only') {
        filteredUsers = filteredUsers.filter((user) => user.isVerified);
      } else {
        filteredUsers = filteredUsers.filter((user) => !user.isVerified);
      }
    }

    if (filters.followers !== 'All') {
      const followersRange = filters.followers.split('-');
      filteredUsers = filteredUsers.filter((user) => {
        const followersCount = user.followers.length;
        const minimum = parseFloat(followersRange[0]);
        const maximum = followersRange[1]
          ? parseFloat(followersRange[1])
          : Infinity;
        return followersCount >= minimum && followersCount < maximum;
      });

      filteredShops = filteredShops.filter((user) => {
        const followersCount = user.followers;
        const minimum = parseFloat(followersRange[0]);
        const maximum = followersRange[1]
          ? parseFloat(followersRange[1])
          : Infinity;
        return followersCount >= minimum && followersCount < maximum;
      });
    }

    if (filters.likes !== 'All') {
      const likesRange = filters.likes.split('-');
      filteredPosts = filteredPosts.filter((post) => {
        const likesCount = post.stars;
        if (likesRange.length === 1) {
          return likesCount >= parseFloat(likesRange[0]);
        } else {
          return (
            likesCount >= parseFloat(likesRange[0]) &&
            likesCount < parseFloat(likesRange[1])
          );
        }
      });
    }

    return { filteredUsers, filteredProducts, filteredPosts, filteredShops };
  };

  const { filteredUsers, filteredProducts, filteredPosts, filteredShops } =
    applyFilters();

  const handleLongPress = (post: Post) => {
    setEnlargedPost(post);
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleCloseEnlarged = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.8,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setEnlargedPost(null);
      scaleAnim.setValue(1);
    });
  };

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dy) > 20;
    },
    onPanResponderMove: (evt, gestureState) => {
      const progress = Math.min(Math.abs(gestureState.dy) / 200, 1);
      scaleAnim.setValue(1 - progress * 0.2);
      opacityAnim.setValue(1 - progress);
    },
    onPanResponderRelease: (evt, gestureState) => {
      if (Math.abs(gestureState.dy) > 100) {
        handleCloseEnlarged();
      } else {
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start();
      }
    },
  });

  const renderShopCard = ({ item }: { item: ShopProfile }) => (
    <TouchableOpacity
      style={styles.userCard}
      onPress={() => router.push(`/shop/${item._id}`)}
    >
      <Image source={{ uri: item.logoUrl }} style={styles.userAvatar} />
      <View style={styles.userInfo}>
        <View style={styles.userNameRow}>
          <Text style={styles.userName}>{item.username}</Text>
          {item.isVerified && (
            <View style={styles.verifiedBadgeContainer}>
              <Check size={10} color="white" />
            </View>
          )}
          <Store size={14} color="#FFD700" />
        </View>
        <Text style={styles.userLocation}>📍 {item.location}</Text>
        <Text style={styles.userFollowers}>{item.followers} followers</Text>
      </View>
      <TouchableOpacity
        style={[
          styles.followButton,
          user?.following.includes(item._id) && styles.followingButton,
        ]}
        onPress={() => followUser(item._id)}
      >
        <Text
          style={[
            styles.followButtonText,
            user?.following.includes(item._id) && styles.followingButtonText,
          ]}
        >
          {user?.following.includes(item._id) ? 'Following' : 'Follow'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderUserCard = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={styles.userCard}
      onPress={() => {
        router.push(`/user/${item._id}`);
      }}
    >
      <Image source={{ uri: item.avatar }} style={styles.userAvatar} />
      <View style={styles.userInfo}>
        <View style={styles.userNameRow}>
          <Text style={styles.userName}>{item.username}</Text>
          {item.isVerified && (
            <View style={styles.verifiedBadgeContainer}>
              <Check size={10} color="#fff" />
            </View>
          )}
        </View>
        <Text style={styles.userFullName} numberOfLines={2}>
          {item.fullName}
        </Text>
      </View>
      <TouchableOpacity
        style={[
          styles.followButton,
          user?.following.includes(item._id) && styles.followingButton,
        ]}
        onPress={() => followUser(item._id)}
      >
        <Text
          style={[
            styles.followButtonText,
            user?.following.includes(item._id) && styles.followingButtonText,
          ]}
        >
          {user?.following.includes(item._id) ? 'Following' : 'Follow'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderProductCard = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => router.push(`/product/${item._id}`)}
    >
      <View style={styles.productImageContainer}>
        <Image source={{ uri: item.imageUrl[0] }} style={styles.productImage} />
        {item.discount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{item.discount}%</Text>
          </View>
        )}
        {!item.stock && (
          <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        )}
        <TouchableOpacity
          style={[
            styles.wishlistButton,
            isInWishlist(item._id) && styles.wishlistButtonActive,
          ]}
          onPress={() => addToWishlist(item)}
          activeOpacity={0.7}
        >
          <Bookmark
            size={16}
            color={theme.background}
            fill={isInWishlist(item._id) ? theme.background : 'transparent'}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.productInfo}>
        <View style={styles.shopInfo}>
          {/* <Text style={styles.shopName}>{item.brand}</Text> */}
        </View>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <View style={styles.priceRow}>
          {item.discount ? (
            <>
              <Text style={styles.productPrice}>
                ${(item.price - item.price * (item.discount / 100)).toFixed(2)}
              </Text>
              <Text style={styles.originalPrice}>${item.price.toFixed(2)}</Text>
            </>
          ) : (
            <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
          )}
        </View>
        <View style={styles.ratingRow}>
          <Star size={12} color="#FFD700" fill="#FFD700" />
          <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderGridItem = ({ item }: { item: Post }) => (
    <TouchableOpacity
      style={styles.gridItem}
      onPress={() => router.push(`/post/${item._id}`)}
      onLongPress={() => handleLongPress(item)}
      delayLongPress={500}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.gridImage} />
    </TouchableOpacity>
  );

  const renderFilterOption = (
    title:
      | string
      | number
      | bigint
      | boolean
      | React.ReactElement<unknown, string | React.JSXElementConstructor<any>>
      | Iterable<React.ReactNode>
      | Promise<
          | string
          | number
          | bigint
          | boolean
          | React.ReactPortal
          | React.ReactElement<
              unknown,
              string | React.JSXElementConstructor<any>
            >
          | Iterable<React.ReactNode>
          | null
          | undefined
        >
      | null
      | undefined,
    options: any[],
    selectedValue: string,
    onSelect: {
      (value: any): void;
      (value: any): void;
      (value: any): void;
      (value: any): void;
      (value: any): void;
      (value: any): void;
      (value: any): void;
      (arg0: any): void;
    }
  ) => (
    <View style={styles.filterSection}>
      <Text style={styles.filterTitle}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.filterOptions}>
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.filterOption,
                selectedValue === option && styles.filterOptionActive,
              ]}
              onPress={() => onSelect(option)}
            >
              <Text
                style={[
                  styles.filterOptionText,
                  selectedValue === option && styles.filterOptionTextActive,
                ]}
              >
                {option}
              </Text>
              {selectedValue === option && (
                <Check size={14} color="#000" style={styles.filterCheck} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  const renderEnlargedPost = (enlargedPost: Post) => {
    if (!enlargedPost) return null;

    return (
      <>
        <View style={styles.enlargedHeader}>
          <View style={styles.enlargedUserInfo}>
            <Image
              source={{ uri: enlargedPost.user.avatar }}
              style={styles.enlargedUserAvatar}
            />
            <View>
              <Text style={styles.enlargedUsername}>{enlargedPost.user.username}</Text>
              <Text style={styles.enlargedTimestamp}>
                {enlargedPost.createdAt}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleCloseEnlarged}>
            <X size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <Image
          source={{ uri: enlargedPost.imageUrl }}
          style={styles.enlargedImage}
        />

        <View style={styles.enlargedFooter}>
          <View style={styles.enlargedActions}>
            <View style={styles.enlargedStat}>
              <TouchableOpacity
                onPress={() => {
                  likePost(enlargedPost._id);
                }}
              >
                <Star
                  size={20}
                  color={isLiked ? '#FFD700' : '#fff'}
                  fill={isLiked ? '#FFD700' : 'transparent'}
                />
              </TouchableOpacity>
              <Text style={styles.enlargedStatText}>{enlargedPost.stars}</Text>
            </View>
            <View style={styles.enlargedStat}>
              <TouchableOpacity
                onPress={() => {
                  router.push(`/post/${enlargedPost._id}`);
                  handleCloseEnlarged();
                }}
              >
                <MessageCircle size={20} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.enlargedStatText}>
                {enlargedPost.comments}
              </Text>
            </View>
          </View>
          <Text style={styles.enlargedCaption}>{enlargedPost.caption}</Text>
        </View>
      </>
    );
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Explore</Text>
          <View style={styles.searchContainer}>
            <Search
              size={20}
              color={theme.textSecondary}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search users, shops, products..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={theme.textSecondary}
            />
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowFilter(true)}
            >
              <Filter size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {/* Trending Users */}
          {exploreData.trendingUsers.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Trending Creators</Text>
              {loading.trendingUsers ? (
                <LoadingView />
              ) : (
                <FlatList
                  data={exploreData.trendingUsers}
                  renderItem={renderUserCard}
                  keyExtractor={(item) => item._id}
                  scrollEnabled={false}
                />
              )}
            </View>
          )}

          {/* Trending Shops */}
          {filteredShops.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Trending Shops</Text>
              {loading.trendingShops ? (
                <LoadingView />
              ) : (
                <FlatList
                  data={filteredShops}
                  renderItem={renderShopCard}
                  keyExtractor={(item) => item._id}
                  scrollEnabled={false}
                />
              )}
            </View>
          )}

          {exploreData.trendingProducts.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Featured Products</Text>
              {loading.trendingProducts ? (
                <LoadingView />
              ) : (
                <FlatList
                  data={exploreData.trendingProducts}
                  renderItem={renderProductCard}
                  keyExtractor={(item) => item._id}
                  numColumns={2}
                  scrollEnabled={false}
                  columnWrapperStyle={styles.gridRowProduct}
                />
              )}
            </View>
          )}

          {/* Discover Posts */}
          {exploreData.trendingPosts.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Discover</Text>
              {loading.trendingPosts ? (
                <LoadingView />
              ) : (
                <FlatList
                  data={exploreData.trendingPosts}
                  renderItem={renderGridItem}
                  keyExtractor={(item) => item._id}
                  numColumns={3}
                  scrollEnabled={false}
                  columnWrapperStyle={styles.gridRow}
                />
              )}
            </View>
          )}

          {/* No Results */}
          {exploreData.trendingUsers.length === 0 &&
            filteredShops.length === 0 &&
            filteredProducts.length === 0 &&
            filteredPosts.length === 0 && (
              <View style={styles.noResults}>
                <View style={styles.noResultsIconContainer}>
                  <SearchX size={48} color={theme.text} />
                </View>
                <Text style={styles.noResultsText}>No results found</Text>
                <Text style={styles.noResultsSubtext}>
                  Try adjusting your search or filters
                </Text>
              </View>
            )}

          <View style={styles.bottomPadding} />
        </ScrollView>

        {/* Enhanced Filter Modal */}
        <Modal
          visible={showFilter}
          animationType="slide"
          transparent
          onRequestClose={() => setShowFilter(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowFilter(false)}>
            <View
              style={{
                flex: 1,
                justifyContent: 'flex-end',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
              }}
            >
              <TouchableWithoutFeedback onPress={() => {}}>
                <View
                  style={{
                    height: '80%',
                    backgroundColor: theme.background,
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                    overflow: 'hidden',
                  }}
                >
                  <SafeAreaView style={styles.filterModal}>
                    <View style={styles.filterHeader}>
                      <Text style={styles.filterHeaderTitle}>
                        Advanced Filters
                      </Text>
                      <TouchableOpacity onPress={() => setShowFilter(false)}>
                        <X size={24} color={theme.text} />
                      </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.filterContent}>
                      {renderFilterOption(
                        'Content Type',
                        filterOptions.contentType,
                        filters.contentType,
                        (value) =>
                          setFilters((prev) => ({
                            ...prev,
                            contentType: value,
                          }))
                      )}

                      {(filters.contentType == 'All' ||
                        filters.contentType == 'Products') &&
                        renderFilterOption(
                          'Price Range',
                          filterOptions.priceRange,
                          filters.priceRange,
                          (value) =>
                            setFilters((prev) => ({
                              ...prev,
                              priceRange: value,
                            }))
                        )}

                      {(filters.contentType == 'All' ||
                        filters.contentType == 'Products') &&
                        renderFilterOption(
                          'Rating',
                          filterOptions.rating,
                          filters.rating,
                          (value) =>
                            setFilters((prev) => ({ ...prev, rating: value }))
                        )}

                      {(filters.contentType == 'All' ||
                        filters.contentType == 'Products') &&
                        renderFilterOption(
                          'Availability',
                          filterOptions.availability,
                          filters.availability,
                          (value) =>
                            setFilters((prev) => ({
                              ...prev,
                              availability: value,
                            }))
                        )}

                      {(filters.contentType == 'All' ||
                        filters.contentType == 'Products') &&
                        renderFilterOption(
                          'Style',
                          filterOptions.style,
                          filters.style,
                          (value) =>
                            setFilters((prev) => ({ ...prev, style: value }))
                        )}

                      {(filters.contentType == 'All' ||
                        filters.contentType == 'Users' ||
                        filters.contentType == 'Shops') &&
                        renderFilterOption(
                          'Verification',
                          filterOptions.verification,
                          filters.verification,
                          (value) =>
                            setFilters((prev) => ({
                              ...prev,
                              verification: value,
                            }))
                        )}

                      {(filters.contentType == 'All' ||
                        filters.contentType == 'Users' ||
                        filters.contentType == 'Shops') &&
                        renderFilterOption(
                          'Followers',
                          filterOptions.followers,
                          filters.followers,
                          (value) =>
                            setFilters((prev) => ({
                              ...prev,
                              followers: value,
                            }))
                        )}

                      {(filters.contentType == 'All' ||
                        filters.contentType == 'Posts') &&
                        renderFilterOption(
                          'Likes',
                          filterOptions.likes,
                          filters.likes,
                          (value) =>
                            setFilters((prev) => ({ ...prev, likes: value }))
                        )}
                    </ScrollView>

                    <View style={styles.filterFooter}>
                      <TouchableOpacity
                        style={styles.clearFiltersButton}
                        onPress={() =>
                          setFilters({
                            contentType: 'All',
                            priceRange: 'All',
                            rating: 'All',
                            availability: 'All',
                            style: 'All',
                            location: 'All',
                            verification: 'All',
                            followers: 'All',
                            likes: 'All',
                          })
                        }
                      >
                        <Text style={styles.clearFiltersText}>Clear All</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.applyFiltersButton}
                        onPress={() => setShowFilter(false)}
                      >
                        <Text style={styles.applyFiltersText}>
                          Apply Filters
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </SafeAreaView>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {enlargedPost && (
          <Modal
            visible={!!enlargedPost}
            transparent
            animationType="none"
            onRequestClose={handleCloseEnlarged}
          >
            {/* Add BlurView for background blur */}
            <Animated.View
              style={[styles.enlargedContainer, { opacity: opacityAnim }]}
              {...panResponder.panHandlers}
            >
              {/* BlurView background */}
              <BlurView
                intensity={50}
                tint="light"
                style={StyleSheet.absoluteFill}
              />
              <TouchableOpacity
                style={styles.enlargedBackdrop}
                onPress={handleCloseEnlarged}
                activeOpacity={1}
              />

              <Animated.View
                style={[
                  styles.enlargedContent,
                  { transform: [{ scale: scaleAnim }] },
                ]}
              >
                {renderEnlargedPost(enlargedPost)}
              </Animated.View>
            </Animated.View>
          </Modal>
        )}
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
