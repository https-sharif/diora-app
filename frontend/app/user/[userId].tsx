import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Grid2x2 as Grid,
  MessageCircle,
  Share,
  MoreHorizontal,
  UserPlus,
  UserMinus,
  Flag,
  X,
  Star,
} from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useNotification } from '@/hooks/useNotification';
import { mockUsers } from '@/mock/User';
import { mockPosts } from '@/mock/Post';
import { User } from '@/types/User';
import { Post } from '@/types/Post';
import { Theme } from '@/types/Theme';
import { useTheme } from '@/contexts/ThemeContext';
import UserSlashIcon from '@/icon/UserSlashIcon';
import ImageSlashIcon from '@/icon/ImageSlashIcon';
import axios from 'axios';
import { API_URL } from '@/constants/api';

const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      paddingTop: -100,
      paddingBottom: -100,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    headerButton: {
      padding: 8,
      width: 40,
    },
    headerTitle: {
      fontSize: 18,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
    },
    headerActions: {
      flexDirection: 'row',
    },
    content: {
      flex: 1,
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
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
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
    profileSection: {
      backgroundColor: theme.background,
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    profileHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    profileImage: {
      width: 80,
      height: 80,
      borderRadius: 40,
      marginRight: 20,
    },
    profileStats: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    statItem: {
      alignItems: 'center',
    },
    statNumber: {
      fontSize: 18,
      fontFamily: 'Inter-Bold',
      color: theme.text,
    },
    statLabel: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
      marginTop: 2,
    },
    profileInfo: {
      marginBottom: 16,
    },
    nameContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    fullName: {
      fontSize: 20,
      fontFamily: 'Inter-Bold',
      color: theme.text,
      marginRight: 8,
    },
    verifiedBadge: {
      backgroundColor: '#007AFF',
      borderRadius: 10,
      width: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    verifiedText: {
      color: '#fff',
      fontSize: 12,
      fontFamily: 'Inter-Bold',
    },
    bio: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: theme.text,
      lineHeight: 22,
      marginBottom: 8,
    },
    actionButtons: {
      flexDirection: 'row',
      gap: 12,
    },
    followButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.text,
      borderRadius: 8,
      paddingVertical: 12,
      gap: 8,
    },
    followingButton: {
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
    },
    followButtonText: {
      color: theme.background,
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
    },
    followingButtonText: {
      color: theme.text,
    },
    messageButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.accent,
      borderRadius: 8,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: theme.border,
      gap: 8,
    },
    messageButtonText: {
      color: '#000',
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
    },
    tabsSection: {
      flexDirection: 'row',
      backgroundColor: theme.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    tab: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      gap: 8,
    },
    activeTab: {
      borderBottomWidth: 2,
      borderBottomColor: theme.text,
    },
    tabText: {
      fontSize: 16,
      fontFamily: 'Inter-Medium',
      color: theme.textSecondary,
    },
    activeTabText: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
    },
    postsGrid: {
      backgroundColor: theme.background,
    },
    postsRow: {
      paddingHorizontal: 1,
    },
    postItem: {
      width: '33%',
      aspectRatio: 1,
      margin: 1,
      position: 'relative',
    },
    postImage: {
      width: '100%',
      height: '100%',
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 60,
      backgroundColor: theme.background,
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
    emptyTitle: {
      fontSize: 24,
      fontFamily: 'Inter-Bold',
      color: theme.text,
      marginBottom: 24,
      textAlign: 'center',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    moreMenu: {
      backgroundColor: theme.card,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      paddingBottom: 34,
    },
    moreMenuHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    moreMenuTitle: {
      fontSize: 18,
      fontFamily: 'Inter-Bold',
      color: theme.text,
    },
    moreMenuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 20,
      gap: 16,
    },
    moreMenuItemText: {
      fontSize: 16,
      fontFamily: 'Inter-Medium',
      color: theme.text,
    },
  });
};

export default function UserProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { user, followUser, token } = useAuth();

  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'posts' | 'liked'>('posts');
  const [posts, setPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);

  const { theme } = useTheme();

  const styles = createStyles(theme);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.data.status) {
          throw new Error('Failed to fetch user profile');
        }

        setUserProfile(response.data.user);

        setIsFollowing(user?.following.includes(user._id) || false);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setLoading(false);
        return;
      }
    };

    const fetchPosts = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/post/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setPosts(response.data.posts);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    const fetchLikedPosts = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/api/post/user/${userId}/liked`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setLikedPosts(response.data.posts);
      } catch (error) {
        console.error('Error fetching liked posts:', error);
      }
    };

    fetchUserProfile();
    fetchPosts();
    fetchLikedPosts();

    setSelectedTab('posts');
    setLoading(false);
  }, [userId]);

  const handleFollow = () => {
    if (!userProfile) return;

    followUser(userProfile._id);
    setIsFollowing(!isFollowing);
  };

  const handleMessage = () => {
    router.push(`/message/${userProfile?._id}`);
  };

  const handleShare = () => {
    Alert.alert('Share Profile', `Share ${userProfile?.fullName}'s profile`);
  };

  const handleReport = () => {
    Alert.alert('Report User', 'Are you sure you want to report this user?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Report',
        style: 'destructive',
        onPress: () => {
          Alert.alert(
            'Reported',
            'User has been reported. Thank you for keeping our community safe.'
          );
          setShowMoreMenu(false);
        },
      },
    ]);
  };

  const handlePostPress = (postId: string) => {
    router.push(`/post/${postId}`);
  };

  const renderPost = ({ item }: { item: Post }) => (
    <TouchableOpacity
      style={styles.postItem}
      onPress={() => handlePostPress(item._id)}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
    </TouchableOpacity>
  );

  const renderGrid = (data: Post[], emptyText: string) => {
    if(!data) {
      return (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <ImageSlashIcon size={40} />
          </View>
          <Text style={styles.emptyTitle}>{emptyText}</Text>
        </View>
      );
    }

    return data.length > 0 ? (
      <FlatList
        data={data}
        renderItem={renderPost}
        keyExtractor={(item) => item._id}
        numColumns={3}
        scrollEnabled={false}
        columnWrapperStyle={styles.postsRow}
        contentContainerStyle={styles.postsGrid}
      />
    ) : (
      <View style={styles.emptyState}>
        <View style={styles.emptyIconContainer}>
          <ImageSlashIcon size={40} />
        </View>
        <Text style={styles.emptyTitle}>{emptyText}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!userProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity activeOpacity={1}>
              <MoreHorizontal size={24} color="transparent" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <UserSlashIcon />
          </View>
          <Text style={styles.emptyTitle}>User not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{userProfile.username}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowMoreMenu(true)}
          >
            <MoreHorizontal size={24} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.profileHeader}>
            <Image
              source={{ uri: userProfile.avatar }}
              style={styles.profileImage}
            />
            <View style={styles.profileStats}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{userProfile.posts}</Text>
                <Text style={styles.statLabel}>Posts</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {userProfile.followers.length}
                </Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {userProfile.following.length}
                </Text>
                <Text style={styles.statLabel}>Following</Text>
              </View>
            </View>
          </View>

          <View style={styles.profileInfo}>
            <View style={styles.nameContainer}>
              <Text style={styles.fullName}>{userProfile.fullName}</Text>
              {userProfile.isVerified && (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>✓</Text>
                </View>
              )}
            </View>
            {userProfile.bio ? (
              <Text style={styles.bio}>{userProfile.bio}</Text>
            ) : null}
          </View>

          {/* Action Buttons */}
          {userProfile._id !== user?._id && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[
                  styles.followButton,
                  isFollowing && styles.followingButton,
                ]}
                onPress={handleFollow}
              >
                {isFollowing ? (
                  <UserMinus size={18} color={theme.text} />
                ) : (
                  <UserPlus size={18} color={theme.background} />
                )}
                <Text
                  style={[
                    styles.followButtonText,
                    isFollowing && styles.followingButtonText,
                  ]}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.messageButton}
                onPress={handleMessage}
              >
                <MessageCircle size={18} color="#000" />
                <Text style={styles.messageButtonText}>Message</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        {/* Posts Tab */}
        <View style={styles.tabsSection}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'posts' && styles.activeTab]}
            onPress={() => setSelectedTab('posts')}
          >
            <Grid size={20} color={selectedTab === 'posts' ? '#000' : '#666'} />
            <Text
              style={[
                styles.tabText,
                selectedTab === 'posts' && styles.activeTabText,
              ]}
            >
              Posts
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'liked' && styles.activeTab]}
            onPress={() => setSelectedTab('liked')}
          >
            <Star
              size={20}
              color={selectedTab === 'liked' ? '#000' : theme.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                selectedTab === 'liked' && styles.activeTabText,
              ]}
            >
              Liked
            </Text>
          </TouchableOpacity>
        </View>
        {/* Posts Grid */}
        {renderGrid(selectedTab === 'posts' ? posts : likedPosts, selectedTab === 'posts' ? 'No posts yet' : 'No liked posts yet')}
      </ScrollView>

      {/* More Menu Modal */}
      <Modal
        visible={showMoreMenu}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMoreMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMoreMenu(false)}
        >
          <View style={styles.moreMenu}>
            <View style={styles.moreMenuHeader}>
              <Text style={styles.moreMenuTitle}>More Options</Text>
              <TouchableOpacity onPress={() => setShowMoreMenu(false)}>
                <X size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.moreMenuItem} onPress={handleShare}>
              <Share size={20} color={theme.text} />
              <Text style={styles.moreMenuItemText}>Share Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.moreMenuItem}
              onPress={handleReport}
            >
              <Flag size={20} color={theme.error} />
              <Text style={[styles.moreMenuItemText, { color: theme.error }]}>
                Report User
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.moreMenuItem}
              onPress={() => {
                Alert.alert('Block User', `Block ${userProfile.fullName}?`);
              }}
            >
              <X size={20} color={theme.error} />
              <Text style={[styles.moreMenuItemText, { color: theme.error }]}>
                Block User
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}
