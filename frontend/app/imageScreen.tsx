import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Image,
  FlatList,
  StyleSheet,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { useCreatePost } from '@/contexts/CreatePostContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Theme } from '@/types/Theme';
import {
  ArrowRight,
  Camera,
  FileText,
  Package,
  Plus,
} from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';

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
    selectorContainer: {
      flexDirection: 'row',
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 4,
      marginHorizontal: 16,
      marginBottom: 24,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 2,
    },
    selectorButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      gap: 8,
    },
    selectorButtonActive: {
      backgroundColor: theme.accent,
    },
    selectorText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.textSecondary,
    },
    selectorTextActive: {
      color: '#000',
    },
    imageContainer: { marginBottom: 16, alignItems: 'center' },
    content: {
      flex: 1,
      padding: 20,
    },
    imagePreview: {
      width: 350,
      height: 350,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.card,
      resizeMode: 'contain',
    },
    imagePlaceholder: {
      width: 350,
      height: 350,
      backgroundColor: theme.card,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 8,
    },
    imagePlaceholderIcon: {
      marginBottom: 8,
    },
    imagePlaceholderText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.textSecondary,
    },
    imageList: {
      paddingHorizontal: 16,
      flex: 1,
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
    },
    imageListTextContainer: {
      padding: 8,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    imageListText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.error,
    },
    addImageButton: {
      width: 100,
      height: 100,
      borderRadius: 8,
      backgroundColor: theme.card,
      alignItems: 'center',
      justifyContent: 'center',
    },
    imageListImage: {
      width: 100,
      height: 100,
      marginRight: 8,
      borderRadius: 8,
    },
    buttonContainer: {
      padding: 20,
      backgroundColor: theme.background,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    submitButton: {
      backgroundColor: theme.accent,
      borderRadius: 12,
      paddingVertical: 16,
      paddingHorizontal: 24,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      shadowColor: theme.accentSecondary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    submitButtonDisabled: {
      backgroundColor: theme.border,
      shadowOpacity: 0.1,
    },
    submitButtonText: {
      fontSize: 18,
      fontWeight: '700',
      color: '#000',
    },
    submitButtonTextDisabled: {
      color: theme.textSecondary,
    },
  });
};

export default function CreateImageScreen() {
  const navigation = useNavigation();
  const { images, setImages, contentType, setContentType, imageUri, setImageUri } = useCreatePost();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { user } = useAuth();

  const pickImages = async () => {
    const limit = contentType === 'product' ? 5 : 1;
    const remaining = limit - images.length;

    if (remaining <= 0) {
      Alert.alert(
        'Limit reached',
        `You can only select up to ${limit} ${contentType === 'product' ? 'images' : 'image'}. Long press on a thumbnail to remove it.`
      );
      return;
    }

    const handleImageResult = (result: ImagePicker.ImagePickerResult) => {
      if (!result.canceled) {
        const newUris = result.assets.map((a) => a.uri);
        const updated = [...images, ...newUris].slice(0, limit);
        setImages(updated);
        setImageUri(updated[0]);
      }
    };

    const launchCamera = async () => {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Camera permission is required to take photos.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images',
      });
      handleImageResult(result);
    };

    const launchGallery = async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Gallery permission is required to select images.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsMultipleSelection: contentType === 'product',
        mediaTypes: ['images'],
        selectionLimit: contentType === 'product' ? remaining : 1,
      });
      handleImageResult(result);
    };

    if (contentType === 'product') {
      launchGallery();
      return;
    }

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Library'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) launchCamera();
          else if (buttonIndex === 2) launchGallery();
        }
      );
    } else {
      Alert.alert('Select Image', 'Choose image source', [
        { text: 'Take Photo', onPress: launchCamera },
        { text: 'Choose from Gallery', onPress: launchGallery },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  

  const handleDeleteImage = (uri: string) => {
    Alert.alert('Delete Image', 'Are you sure you want to delete this image?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const updated = images.filter((img) => img !== uri);
          setImages(updated);
          setImageUri(updated.length > 0 ? updated[0] : null);
        },
      },
    ]);
  };

  const handleNext = () => {
    if (images.length === 0) {
      Alert.alert('Select at least one image');
      return;
    }
    navigation.navigate('CreateForm' as never);
  };

  const handleSelectorChange = (type: 'post' | 'product') => {
    if (type !== contentType) {
      setImages([]);
      setImageUri(null);
    }
    setContentType(type);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create</Text>
        <TouchableOpacity onPress={handleNext} disabled={images.length === 0}>
          {images.length > 0 ? <ArrowRight size={24} color={theme.text} /> : null }
        </TouchableOpacity>
      </View>

      {user && user.type === 'shop' && (
        <View style={styles.selectorContainer}>
          <TouchableOpacity
            style={[
              styles.selectorButton,
              contentType === 'post' && styles.selectorButtonActive,
            ]}
            onPress={() => handleSelectorChange('post')}
          >
            <FileText
              size={20}
              color={contentType === 'post' ? '#000' : theme.textSecondary}
            />
            <Text
              style={[
                styles.selectorText,
                contentType === 'post' && styles.selectorTextActive,
              ]}
            >
              Post
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.selectorButton,
              contentType === 'product' && styles.selectorButtonActive,
            ]}
            onPress={() => handleSelectorChange('product')}
          >
            <Package
              size={20}
              color={contentType === 'product' ? '#000' : theme.textSecondary}
            />
            <Text
              style={[
                styles.selectorText,
                contentType === 'product' && styles.selectorTextActive,
              ]}
            >
              Product
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.imageContainer}>
        <TouchableOpacity onPress={pickImages}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.imagePreview} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Camera
                size={60}
                color={theme.textSecondary}
                style={styles.imagePlaceholderIcon}
              />
              <Text style={styles.imagePlaceholderText}>Select an Image</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
        
      {images.length > 0 && 
        <TouchableOpacity style={styles.imageListTextContainer} activeOpacity={0.8} onPress={() => {
          Alert.alert('Remove all images', 'Are you sure you want to remove all images?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Remove', style: 'destructive', onPress: () => {
              setImages([]);
              setImageUri(null);
            }
          }
        ])}}>
          <Text style={styles.imageListText}>Remove {images.length > 1 && 'all' }</Text>
        </TouchableOpacity>
      }

      <View style={styles.imageList}>
      <FlatList
        data={
          contentType === 'product' && images.length > 0 && images.length < 5
            ? [...images, 'add-button']
            : images
        }
        horizontal
        keyExtractor={(item, index) => item + index}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingLeft: 0 }}
        ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
        renderItem={({ item }) =>
          item === 'add-button' ? (
            <TouchableOpacity onPress={pickImages} style={styles.addImageButton}>
              <Plus size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => setImageUri(item)}
              onLongPress={() => handleDeleteImage(item)}
              activeOpacity={0.9}
            >
              <Image source={{ uri: item }} style={styles.imageListImage} />
            </TouchableOpacity>
          )
        }
      />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            images.length === 0 && styles.submitButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={images.length === 0}
        >
          <Text
            style={[
              styles.submitButtonText,
              images.length === 0 && styles.submitButtonTextDisabled,
            ]}
          >
            Next
          </Text>
          <ArrowRight
            size={24}
            color={images.length === 0 ? theme.textSecondary : '#000'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
