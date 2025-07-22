import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Dimensions,
  Modal,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Star,
  MessageCircle,
  Share,
  X,
  Send,
  MoreHorizontal,
  Flag,
} from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { Comment } from '@/types/Comment';
import { Post } from '@/types/Post';
import { Theme } from '@/types/Theme';
import { useTheme } from '@/contexts/ThemeContext';
import ImageSlashIcon from '@/icon/ImageSlashIcon';
import axios from 'axios';
import { API_URL } from '@/constants/api';
import { format } from 'timeago.js';

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
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    headerButton: {
      padding: 8,
    },
    headerTitle: {
      fontSize: 18,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
    },
    content: {
      flex: 1,
    },
    userSection: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
    },
    userAvatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: theme.card,
    },
    userInfo: {
      marginLeft: 12,
      flex: 1,
    },
    username: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
    },
    timestamp: {
      fontSize: 12,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
      marginTop: 2,
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 16,
      gap: 20,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    actionText: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
      color: theme.text,
    },
    captionSection: {
      paddingHorizontal: 16,
      paddingBottom: 16,
    },
    caption: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: theme.text,
      lineHeight: 24,
    },
    captionUsername: {
      fontFamily: 'Inter-Bold',
      color: theme.text,
    },
    tagsSection: {
      paddingHorizontal: 16,
      paddingBottom: 16,
    },
    tags: {
      flexDirection: 'row',
      gap: 8,
    },
    commentsSection: {
      paddingHorizontal: 16,
      paddingTop: 16,
    },
    commentsTitle: {
      fontSize: 18,
      fontFamily: 'Inter-Bold',
      color: theme.text,
      marginBottom: 16,
    },
    loadingContainer: {
      flex: 1,
      backgroundColor: theme.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    commentsList: {
      flex: 1,
      padding: 16,
    },
    commentItem: {
      flexDirection: 'row',
      marginBottom: 16,
    },
    replyItem: {
      marginLeft: 40,
      marginTop: 8,
      marginBottom: 8,
    },
    commentAvatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
    },
    commentContent: {
      flex: 1,
      marginLeft: 12,
    },
    commentHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 4,
    },
    commentUser: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
    },
    commentTime: {
      fontSize: 12,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
    },
    commentText: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: theme.text,
      lineHeight: 20,
      marginBottom: 8,
    },
    commentActions: {
      flexDirection: 'row',
      gap: 16,
    },
    commentAction: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    commentActionText: {
      fontSize: 12,
      fontFamily: 'Inter-Medium',
      color: theme.textSecondary,
    },
    bottomPadding: {
      height: 100,
    },
    commentInput: {
      borderTopWidth: 1,
      borderTopColor: theme.border,
      padding: 16,
      backgroundColor: theme.background,
      margin: -10,
    },
    replyingIndicator: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: theme.card,
      padding: 8,
      borderRadius: 8,
      marginBottom: 8,
    },
    replyingText: {
      fontSize: 12,
      fontFamily: 'Inter-Medium',
      color: theme.textSecondary,
    },
    commentInputRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 12,
    },
    commentTextInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      maxHeight: 100,
      color: theme.text,
    },
    sendButton: {
      padding: 12,
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
    emptyText: {
      fontSize: 24,
      fontFamily: 'Inter-Bold',
      color: theme.text,
      marginBottom: 24,
      textAlign: 'center',
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

export default function PostDetailScreen() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const [isStarred, setIsStarred] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [post, setPost] = useState<Post | null>(null);
  const { user, likePost, token } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [imageHeight, setImageHeight] = useState(400);
  const { theme } = useTheme();
  const styles = createStyles(theme);

  useEffect(() => {
    const fetchPostAndComment = async () => {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/api/post/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const post = response.data.post;

      if (!post) {
        setIsLoading(false);
        return;
      }
      setPost(post);

      const commentsResponse = await axios.get(
        `${API_URL}/api/comment/post/${postId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!commentsResponse.data.status) {
        console.error(
          'Failed to fetch comments:',
          commentsResponse.data.message
        );
        setIsLoading(false);
        return;
      }
      setComments(commentsResponse.data.comments);

      setIsLoading(false);

      setIsStarred(
        (post.stars > 0 && user?.likedPosts?.includes(post._id)) || false
      );
    };

    fetchPostAndComment();
  }, [postId, token]);

  useEffect(() => {
    if (post) {
      Image.getSize(
        post.imageUrl,
        (width, height) => {
          const screenWidth = Dimensions.get('window').width;
          const scaleFactor = width / screenWidth;
          let scaledHeight = height / scaleFactor;

          if (scaledHeight > 400) scaledHeight = 400;

          setImageHeight(scaledHeight);
        },
        (err) => console.error('Failed to get image size:', err)
      );
    }
  }, [post]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Post</Text>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowMoreMenu(true)}
            disabled
          >
            <MoreHorizontal size={24} color={theme.background} />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.text} />
          <Text style={{ color: theme.text, fontSize: 16, marginTop: 8 }}>
            Loading post...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!post) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <View style={styles.emptyIconContainer}>
            <ImageSlashIcon size={40} />
          </View>
          <Text style={styles.emptyText}>Post not found</Text>
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

  const handleStar = () => {
    const newStarred = !isStarred;
    setIsStarred(newStarred);
    post.stars += newStarred ? 1 : -1;
    likePost(post._id);
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !user) return;

    try {
      const url = replyingTo
        ? `${API_URL}/api/comment/reply/${replyingTo}`
        : `${API_URL}/api/comment/create`;

      const payload = { userId: user._id, postId: post._id, text: newComment };

      const response = await axios.post(url, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.status) {
        const newAdded = response.data.comment;

        if (replyingTo) {
          setComments((prev) =>
            prev.map((comment) =>
              comment._id === replyingTo
                ? {
                    ...comment,
                    replies: [...(comment.replies || []), newAdded],
                  }
                : comment
            )
          );
          setReplyingTo(null);
        } else {
          setComments((prev) => [newAdded, ...prev]);
        }

        post.comments += 1;
        setNewComment('');
      } else {
        console.error('Failed to add comment:', response.data.message);
      }
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const handleShare = () => {
    Alert.alert('Share', `Share ${post.user.username}'s post`);
  };

  const handleReport = () => {
    Alert.alert('Report Post', 'Are you sure you want to report this post?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Report',
        style: 'destructive',
        onPress: () => {
          Alert.alert(
            'Reported',
            'Post has been reported. Thank you for keeping our community safe.'
          );
          setShowMoreMenu(false);
        },
      },
    ]);
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <View
      key={comment._id}
      style={[styles.commentItem, isReply && styles.replyItem]}
    >
      <TouchableOpacity
        onPress={() => router.push(`/user/${comment.user._id}`)}
      >
        <Image
          source={{ uri: comment.user.avatar }}
          style={styles.commentAvatar}
        />
      </TouchableOpacity>
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <TouchableOpacity
            onPress={() => router.push(`/user/${comment.user._id}`)}
          >
            <Text style={styles.commentUser}>{comment.user.username}</Text>
          </TouchableOpacity>
          <Text style={styles.commentTime}>
            {format(new Date(comment.createdAt))}
          </Text>
        </View>
        <Text style={styles.commentText}>{comment.text}</Text>
        <View style={styles.commentActions}>
          {!isReply && (
            <TouchableOpacity
              style={styles.commentAction}
              onPress={() => setReplyingTo(comment._id)}
            >
              <Text style={styles.commentActionText}>Reply</Text>
            </TouchableOpacity>
          )}
        </View>
        {comment.replies?.map((item) => {
          return renderComment(item, true);
        })}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post</Text>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => setShowMoreMenu(true)}
        >
          <MoreHorizontal size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.userSection}>
          <TouchableOpacity
            onPress={() => router.push(`/user/${post.user._id}`)}
          >
            <Image
              source={{ uri: post.user.avatar }}
              style={styles.userAvatar}
            />
          </TouchableOpacity>
          <View style={styles.userInfo}>
            <TouchableOpacity
              onPress={() => router.push(`/user/${post.user._id}`)}
            >
              <Text style={styles.username}>{post.user.username}</Text>
            </TouchableOpacity>
            <Text style={styles.timestamp}>
              {format(new Date(post.createdAt))}
            </Text>
          </View>
        </View>

        <Image
          source={{ uri: post.imageUrl }}
          style={{
            width: '100%',
            height: imageHeight,
            resizeMode: 'contain',
          }}
        />

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleStar}>
            <Star
              size={24}
              color={isStarred ? '#FFD700' : theme.text}
              fill={isStarred ? '#FFD700' : 'transparent'}
              strokeWidth={2}
            />
            <Text style={[styles.actionText]}>{post.stars}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <MessageCircle size={24} color={theme.text} strokeWidth={2} />
            <Text style={styles.actionText}>{post.comments}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Share size={24} color={theme.text} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* Caption */}
        {post.caption && (
          <View style={styles.captionSection}>
            <Text style={styles.caption}>
              <Text style={styles.captionUsername}>{post.user.username}</Text>{' '}
              {post.caption}
            </Text>
          </View>
        )}
        {/* Comments */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>Comments ({post.comments})</Text>
          <ScrollView
            style={[styles.commentsList, { flex: 1 }]}
            contentContainerStyle={{ paddingBottom: 80 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {comments.map((comment) => renderComment(comment))}
          </ScrollView>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Comment Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <View style={styles.commentInput}>
          {replyingTo && (
            <View style={styles.replyingIndicator}>
              <Text style={styles.replyingText}>
                Replying to{' '}
                {comments.find((c) => c._id === replyingTo)?.user.username}
              </Text>
              <TouchableOpacity onPress={() => setReplyingTo(null)}>
                <X size={16} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.commentInputRow}>
            <TextInput
              style={styles.commentTextInput}
              placeholder="Add a comment..."
              value={newComment}
              onChangeText={setNewComment}
              multiline
              placeholderTextColor={theme.textSecondary}
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleAddComment}
              disabled={!newComment.trim()}
            >
              <Send
                size={20}
                color={newComment.trim() ? theme.text : theme.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

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
              <Text style={styles.moreMenuItemText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.moreMenuItem}
              onPress={handleReport}
            >
              <Flag size={20} color={theme.error} />
              <Text style={[styles.moreMenuItemText, { color: theme.error }]}>
                Report
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}
