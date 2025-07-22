import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, Grid2x2 as Grid, Star, LogOut } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { Post } from '@/types/Post';
import { Theme } from '@/types/Theme';  
import axios from 'axios';
import { API_URL } from '@/constants/api';

const createStyles = (theme: Theme) =>
  StyleSheet.create({
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
      paddingVertical: 16,
      backgroundColor: theme.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.background,
    },
    title: {
      fontSize: 28,
      fontFamily: 'Inter-Bold',
      color: theme.text,
    },
    headerButtons: {
      flexDirection: 'row',
      gap: 16,
    },
    headerButton: {
      padding: 4,
    },
    content: {
      flex: 1,
    },
    profileSection: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.background,
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.background,
    },
    profileImage: {
      width: 80,
      height: 80,
      borderRadius: 40,
    },
    profileInfo: {
      flex: 1,
      marginLeft: 16,
    },
    fullName: {
      fontSize: 20,
      fontFamily: 'Inter-Bold',
      color: theme.text,
    },
    username: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
      marginTop: 2,
    },
    bio: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: theme.text,
      marginTop: 8,
      lineHeight: 20,
    },
    statsSection: {
      flexDirection: 'row',
      backgroundColor: theme.background,
      paddingVertical: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.background,
    },
    statItem: {
      flex: 1,
      alignItems: 'center',
    },
    statNumber: {
      fontSize: 20,
      fontFamily: 'Inter-Bold',
      color: theme.text,
    },
    statLabel: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
      marginTop: 4,
    },
    tabsSection: {
      flexDirection: 'row',
      backgroundColor: theme.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.background,
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
      paddingHorizontal: 2,
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
      backgroundColor: theme.card,
    },
  });

export default function UserProfile() {
  const { user, logout, token } = useAuth();
  const [activeTab, setActiveTab] = React.useState<'posts' | 'liked'>('posts');
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [myPosts, setMyPosts] = useState([]);
  const [myLikedPosts, setMyLikedPosts] = useState([]);

  const fetchData = async () => {
    if (!user) return;
    
    try {
      const likedPostsResponse = await axios.get(`${API_URL}/api/post/user/${user?._id}/liked`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      setMyLikedPosts(likedPostsResponse.data.posts);

      const myPostsResponse = await axios.get(`${API_URL}/api/post/user/${user?._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMyPosts(myPostsResponse.data.posts);

    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (user?._id) fetchData();
  }, [user, user?.posts, user?.likedPosts, token]);

  const handleTabPress = (tab: 'posts' | 'liked') => { setActiveTab(tab) };

  const handlePostPress = (postId: string) => {
    router.push(`/post/${postId}`);
  };

  const handleSettingsPress = () => {
    router.push('/settings');
  };

  const renderPost = ({ item }: { item: Post }) => {
    return (
      <TouchableOpacity
        style={styles.postItem}
        onPress={() => handlePostPress(item._id)}
      >
        <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
      </TouchableOpacity>
    )
  }

  if (!user) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>User Profile</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleSettingsPress}
          >
            <Settings size={24} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={logout}>
            <LogOut size={24} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Info */}
        <View style={styles.profileSection}>
          <Image source={{ uri: user.avatar }} style={styles.profileImage} />
          <View style={styles.profileInfo}>
            <Text style={styles.fullName}>{user.fullName}</Text>
            <Text style={styles.username}>@{user.username}</Text>
            <Text style={styles.bio}>{user.bio}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.posts}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {user.followers.length.toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.following.length.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>

        {/* Posts Tab */}
        <View style={styles.tabsSection}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'posts' ? styles.activeTab : {}]}
            onPress={() => handleTabPress('posts')}
            activeOpacity={0.7}
          >
            <Grid
              size={activeTab === 'posts' ? 22 : 20}
              color={activeTab === 'posts' ? theme.text : theme.textSecondary}
            />
            <Text
              style={
                activeTab === 'posts' ? styles.activeTabText : styles.tabText
              }
            >
              Posts
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'liked' ? styles.activeTab : {}]}
            onPress={() => handleTabPress('liked')}
            activeOpacity={0.7}
          >
            <Star
              size={activeTab === 'liked' ? 22 : 20}
              color={activeTab === 'liked' ? theme.text : theme.textSecondary}
            />
            <Text
              style={
                activeTab === 'liked' ? styles.activeTabText : styles.tabText
              }
            >
              Liked
            </Text>
          </TouchableOpacity>
        </View>

        {/* Posts Grid */}
        {activeTab === 'posts' && (
          <FlatList
            data={myPosts}
            renderItem={renderPost}
            keyExtractor={(item) => item._id}
            numColumns={3}
            scrollEnabled={false}
            columnWrapperStyle={styles.postsRow}
            contentContainerStyle={styles.postsGrid}
          />
        )}

        {/* Liked Posts */}
        {activeTab === 'liked' && (
          <FlatList
            data={myLikedPosts}
            renderItem={renderPost}
            keyExtractor={(item) => item._id}
            numColumns={3}
            scrollEnabled={false}
            columnWrapperStyle={styles.postsRow}
            contentContainerStyle={styles.postsGrid}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
