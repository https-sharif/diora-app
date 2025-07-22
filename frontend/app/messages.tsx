import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Plus, ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useMessage } from '@/hooks/useMessage';
import { Conversation } from '@/types/Conversation';
import { useAuth } from '@/hooks/useAuth';
import { mockUsers } from '@/mock/User';
import { mockMessages } from '@/mock/Message';

const createStyles = (theme: any) => {
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
    title: {
      fontSize: 24,
      fontFamily: 'Inter-Bold',
      color: theme.text,
    },
    newChatButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.accentSecondary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.card,
      marginHorizontal: 20,
      marginVertical: 16,
      borderRadius: 12,
      paddingHorizontal: 16,
      height: 44,
    },
    searchIcon: {
      marginRight: 12,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: theme.text,
    },
    conversationsList: {
      flex: 1,
      width: '95%',
      alignSelf: 'center',
      backgroundColor: theme.background,
    },
    conversationsContent: {
      paddingBottom: 100,
      gap: 4,
    },
    conversationItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: theme.card,
      borderRadius: 12,
    },
    avatarContainer: {
      position: 'relative',
      marginRight: 16,
    },
    avatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
    },
    onlineIndicator: {
      position: 'absolute',
      bottom: 2,
      right: 2,
      width: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: theme.success,
      borderWidth: 2,
      borderColor: theme.background,
    },
    conversationContent: {
      flex: 1,
    },
    conversationHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    conversationName: {
      fontSize: 17,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
      flex: 1,
    },
    conversationTime: {
      fontSize: 15,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
      marginLeft: 8,
    },
    conversationFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    lastMessage: {
      fontSize: 15,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
      flex: 1,
    },
    unreadMessage: {
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
    },
    typingMessage: {
      color: theme.primary,
      fontStyle: 'italic',
    },
    unreadBadge: {
      backgroundColor: '#007AFF',
      borderRadius: 12,
      minWidth: 24,
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 8,
      marginLeft: 8,
    },
    unreadBadgeText: {
      color: '#FFFFFF',
      fontSize: 13,
      fontFamily: 'Inter-Bold',
    },
  });
};

export default function MessagesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [newChatVisible, setNewChatVisible] = useState(false);
  const [myConversations, setMyConversations] = useState<Conversation[]>([]);

  const { theme } = useTheme();
  const { conversations, messages } = useMessage();
  const { user } = useAuth();
  const styles = createStyles(theme);

  useEffect(() => {
    if (user) {
      setMyConversations(conversations.filter(conv => conv.participants.includes(user._id)));
    }
  }, [user, conversations]);

  const handleConversationPress = (conversationId: string) => {
    router.push(`/message/${conversationId}`);
  };

  function handleNewChatPress() {
    setNewChatVisible(true);

    // implement later
  }

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderConversationItem = ({ item }: { item: Conversation }) => {
    const conversationLastMessage = myConversations.find(conversation => conversation.id === item.id)?.lastMessageId;
    
    const lastMessage = mockMessages.find(message => message.id === conversationLastMessage);

    const participants = myConversations.find(c => c.id === item.id)?.participants;
    let senderName = '';
    let senderAvatar = '';
    if(participants && participants.length > 2) {
      senderName = conversations.find(c => c.id === item.id)?.name || '';
      senderAvatar = item.avatar || '';
    } else {
      const senderId = participants?.find(p => p !== user?._id);
      const sender = mockUsers.find(u => u._id === senderId);
      senderName = sender?.username || 'Unknown';
      senderAvatar = sender?.avatar || '';
    }

    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() => handleConversationPress(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          <Image source={{ uri: senderAvatar }} style={styles.avatar} />
          {item.isOnline && <View style={styles.onlineIndicator} />}
        </View>

        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={styles.conversationName} numberOfLines={1}>
              {senderName}
            </Text>
            <Text style={styles.conversationTime}>
              {lastMessage ? formatTime(lastMessage.timestamp) : ''}
            </Text>
          </View>

          <View style={styles.conversationFooter}>
            <Text
              style={[
                styles.lastMessage,
                item.unreadCount > 0 && styles.unreadMessage,
                item.isTyping && styles.typingMessage,
              ]}
              numberOfLines={1}
            >
              {item.isTyping ? 'Typing...' : lastMessage?.text || ''}
            </Text>

            {item.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>
                  {item.unreadCount > 99 ? '99+' : item.unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    )};

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Messages</Text>
        <TouchableOpacity
          style={styles.newChatButton}
          onPress={handleNewChatPress}
        >
          <Plus size={24} color={theme.background} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Search
          size={20}
          color={theme.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search conversations..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={theme.textSecondary}
        />
      </View>

      <FlatList
        data={myConversations}
        renderItem={renderConversationItem}
        keyExtractor={(item) => item.id}
        style={styles.conversationsList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.conversationsContent}
      />
    </SafeAreaView>
  );
}
