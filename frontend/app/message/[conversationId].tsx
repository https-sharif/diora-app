import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Send,
  Plus,
  Camera,
  Menu,
  Mic,
  MessageCircleOff,
  Inbox,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useMessage } from '@/hooks/useMessage';
import { useAuth } from '@/hooks/useAuth';
import { mockProducts } from '@/mock/Product';
import { useTheme } from '@/contexts/ThemeContext';
import { mockUsers } from '@/mock/User';
import { Theme } from '@/types/Theme';
import { User } from '@/types/User';
import { Conversation } from '@/types/Conversation';
import { Message } from '@/types/Message';

const { width } = Dimensions.get('window');

const createStyles = (theme: Theme, lightTheme: Theme, darkTheme: Theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      paddingBottom: -100,
      paddingTop: -100,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 0.5,
      borderBottomColor: theme.border,
    },
    backButton: {
      width: 44,
      height: 44,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 8,
    },
    headerInfo: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerAvatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      marginRight: 12,
    },
    headerText: {
      flex: 1,
    },
    headerName: {
      fontSize: 17,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
    },
    headerStatus: {
      fontSize: 13,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
      marginTop: 1,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerAction: {
      width: 44,
      height: 44,
      justifyContent: 'center',
      alignItems: 'center',
    },
    messagesList: {
      flex: 1,
    },
    messagesContent: {
      paddingVertical: 16,
      paddingHorizontal: 16,
    },
    messageContainer: {
      flexDirection: 'row',
      marginBottom: 16,
      alignItems: 'flex-end',
    },
    myMessageContainer: {
      justifyContent: 'flex-end',
    },
    messageAvatar: {
      width: 28,
      height: 28,
      borderRadius: 14,
      marginRight: 8,
    },
    messageBubble: {
      maxWidth: width * 0.75,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    myMessageBubble: {
      backgroundColor: darkTheme.card,
      borderBottomRightRadius: 6,
      borderWidth: 1,
      borderColor: theme.border,
    },
    otherMessageBubble: {
      backgroundColor: darkTheme.accent,
      borderBottomLeftRadius: 6,
    },
    messageText: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: lightTheme.text,
      lineHeight: 22,
    },
    myMessageText: {
      color: darkTheme.text,
    },
    messageImage: {
      width: width * 0.6,
      height: width * 0.6,
      resizeMode: 'contain',
      borderRadius: 12,
      marginBottom: 4,
    },
    messageTime: {
      fontSize: 12,
      fontFamily: 'Inter-Regular',
      color: darkTheme.border,
      marginTop: 4,
      alignSelf: 'flex-end',
    },
    myMessageTime: {
      color: darkTheme.textSecondary,
    },
    inputContainer: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      paddingBottom: Platform.OS === 'ios' ? 34 : 12,
      borderTopWidth: 0.5,
      borderTopColor: theme.border,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 12,
    },
    modalBackground: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.3)',
      justifyContent: 'flex-end',
    },
    dropdownContainer: {
      backgroundColor: theme.card,
      paddingVertical: 24,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      paddingHorizontal: 20,
    },
    dropdownItem: {
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    dropdownText: { fontSize: 18 , color: theme.text},
    cameraButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: darkTheme.accent,
      justifyContent: 'center',
      alignItems: 'center',
    },
    textInputContainer: {
      flex: 1,
      backgroundColor: theme.card,
      alignContent: 'center',
      justifyContent: 'center',
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 8,
      maxHeight: 100,
    },
    textInput: {
      fontSize: 16,
      paddingTop: 0,
      fontFamily: 'Inter-Regular',
      color: theme.text,
      minHeight: 20,
    },
    sendButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.accent,
      justifyContent: 'center',
      alignItems: 'center',
    },
    sendButtonDisabled: {
      backgroundColor: theme.border,
    },
    micButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.accent,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorIconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.card,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
    },
    errorText: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
      marginBottom: 24,
    },
    errorBackButton: {
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
    productInfo: {
      flexDirection: 'column',
      gap: 4,
    },
    productContainer: {
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: 4,
    },
    productName: {
      fontSize: 14,
      fontFamily: 'Inter-Bold',
      color: '#000000',
    },
    myProductName: {
      color: '#fff',
    },
    productPrice: {
      fontSize: 12,
      fontFamily: 'Inter-SemiBold',
      color: theme.textSecondary,
    },
    productImage: {
      width: 150,
      height: 150,
      resizeMode: 'contain',
      borderRadius: 8,
    },
  });
};


export default function MessageScreen() {
  const [messageText, setMessageText] = useState('');
  const [myMessages, setMyMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const { theme, lightTheme, darkTheme } = useTheme();
  const styles = createStyles(theme, lightTheme, darkTheme);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const { user } = useAuth();
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const { conversations, messages, sendMessage } = useMessage();
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (!conversationId) return;
    const foundConv = conversations.find(
      (c) => c.id == conversationId
    ) as Conversation;
    const filteredMessages = messages.filter(
      (m) => m.conversationId === conversationId
    );

    setConversation(foundConv);
    setMyMessages(filteredMessages);
  }, [conversationId, conversations, messages]);

  useEffect(() => {
    if (conversation) {
      const otherUser = mockUsers.find(
        (u) => u._id === conversation.participants.find((p) => p !== user?._id)
      );
      if (otherUser) {
        setOtherUser(otherUser);
      }
    }
  }, [conversation]);

  const handleProfilePress = (userId: string) => {
    if (!conversation?.isGroup) {
      router.push(`/user/${userId}`);
    }
  };

  const handleGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Gallery permission denied');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
    });

    if (!result.canceled) {
      const photo = result.assets[0];
      sendMessage(conversationId, '', undefined, photo.uri);
    }
  };

  const handleCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Camera permission denied');
      return;
    }
  
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 1,
    });
  
    if (!result.canceled) {
      const photo = result.assets[0];
      sendMessage(conversationId, '', undefined, photo.uri);
    }
  };
  
  // Send message handler
  const handleSendMessage = () => {
    if (!messageText.trim() || !conversationId) return;

    sendMessage(conversationId, messageText.trim());
    setMessageText('');

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    if (!user) return null;
    const isMe = item.senderId === user._id;

    const formattedTime = new Date(item.timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const product = item.productId
      ? mockProducts.find((p) => p.id === item.productId)
      : null;

    return (
      <View
        style={[styles.messageContainer, isMe && styles.myMessageContainer]}
      >
        {!isMe && conversation?.avatar && (
          <Image
            source={{ uri: conversation.avatar }}
            style={styles.messageAvatar}
          />
        )}

        {isMe && conversation?.avatar && (
          <Image
            source={{ uri: conversation.avatar }}
            style={styles.messageAvatar}
          />
        )}

        <View
          style={[
            styles.messageBubble,
            isMe ? styles.myMessageBubble : styles.otherMessageBubble,
          ]}
        >
          {item.type === 'text' && item.text ? (
            <Text style={[styles.messageText, isMe && styles.myMessageText]}>
              {item.text}
            </Text>
          ) : item.type === 'image' && item.imageUrl ? (
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.messageImage}
            />
          ) : item.type === 'product' && item.productId ? (
            <TouchableOpacity
              onPress={() => router.push(`/product/${item.productId}`)}
              activeOpacity={0.8}
            >
              <View style={styles.productContainer}>
                <Image
                  source={{ uri: product?.imageUrl[0] }}
                  style={styles.productImage}
                />
                <View style={styles.productInfo}>
                  <Text
                    style={[styles.productName, isMe && styles.myProductName]}
                  >
                    {product?.name}
                  </Text>
                  <Text style={styles.productPrice}>${product?.price}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ) : (
            <Text style={[styles.messageText, isMe && styles.myMessageText]}>
              Unsupported message type
            </Text>
          )}

          <Text style={[styles.messageTime, isMe && styles.myMessageTime]}>
            {formattedTime}
          </Text>
        </View>
      </View>
    );
  };

  if (!conversation) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <View style={styles.errorIconContainer}>
            <MessageCircleOff size={40} color={theme.text} strokeWidth={2} />
          </View>
          <Text style={styles.errorText}>Conversation not found</Text>
          <TouchableOpacity
            style={styles.errorBackButton}
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
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={theme.text} strokeWidth={2} />
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <Image
              source={{ uri: conversation.avatar || otherUser?.avatar }}
              style={styles.headerAvatar}
            />
            <View style={styles.headerText}>
              <TouchableOpacity
                onPress={() => handleProfilePress(otherUser?._id || '')}
              >
                <Text style={styles.headerName}>
                  {conversation.name || otherUser?.username}
                </Text>
              </TouchableOpacity>
              <Text style={styles.headerStatus}>
                {conversation.isOnline ? 'Online' : 'Last seen recently'}
              </Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerAction}>
              <Menu size={22} color={theme.text} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages */}
        {myMessages.length > 0 ? (
          <FlatList
            ref={flatListRef}
            data={myMessages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            style={styles.messagesList}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
          />
        ) : (
          <View style={styles.errorContainer}>
            <View style={styles.errorIconContainer}>
              <Inbox size={40} color={theme.text} strokeWidth={2} />
            </View>
            <Text style={styles.errorText}>
              No chats yet. Be the first to say hey.
            </Text>
          </View>
        )}

        {/* Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <TouchableOpacity style={styles.cameraButton} onPress={() => setShowDropdown(true)}>
              <Plus size={24} color='#000' strokeWidth={2} />
            </TouchableOpacity>
            <Modal
                visible={showDropdown}
                transparent
                animationType="fade"
                onRequestClose={() => setShowDropdown(false)}
              >
                <TouchableOpacity
                  style={styles.modalBackground}
                  activeOpacity={1}
                  onPressOut={() => setShowDropdown(false)}
                >
                  <View
                    style={styles.dropdownContainer}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        setShowDropdown(false);
                        setTimeout(() => {
                          handleCamera();
                        }, 600);
                      }}
                      style={styles.dropdownItem}
                    >
                      <Text style={styles.dropdownText}>Take Photo</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        setShowDropdown(false);
                        setTimeout(() => {
                          handleGallery();
                        }, 600);
                      }}
                      style={styles.dropdownItem}
                    >
                      <Text style={styles.dropdownText}>Open from {Platform.OS === 'ios' ? 'Photos' : 'Gallery'}</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              </Modal>

            <View style={styles.textInputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Message..."
                value={messageText}
                onChangeText={setMessageText}
                multiline
                maxLength={1000}
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            <TouchableOpacity
              style={[styles.sendButton,  styles.sendButtonDisabled]}
              onPress={handleSendMessage}
              disabled={messageText.trim() === ''}
            >
              <Send size={20} color={messageText.trim() === '' ? theme.primary : '#000'} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
