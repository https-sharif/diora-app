import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useCreatePost } from '@/contexts/CreatePostContext';
import CategorySelector from '@/components/CategorySelector';
import { Theme } from '@/types/Theme';
import { useTheme } from '@/contexts/ThemeContext';
import { Check, Plus } from 'lucide-react-native';
import { router, useNavigation } from 'expo-router';

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
      marginBottom: 16,
    },
    subtitle: {
      fontSize: 16,
      fontFamily: 'Inter-Bold',
      color: theme.text,
    },
    labelContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginLeft: 4,
    },
    input: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.card,
      borderRadius: 12,
      borderWidth: 1,
      marginTop: 6,
      borderColor: theme.border,
      paddingHorizontal: 16,
      paddingVertical: 12,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 2,
      color: theme.text,
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
      color: '#fff',
    },
  });
}

export default function CreateFormScreen() {
  const { formData, setFormData, contentType, images, createPost, createProduct, reset } = useCreatePost();
  const isProduct = contentType === 'product';
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigation = useNavigation();

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if(isProduct) {
        await createProduct();
      } else {
        await createPost();
      }
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsSubmitting(false);
      navigation.goBack();
      router.push('/(tabs)');
      reset();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Create</Text>
          <TouchableOpacity onPress={handleSubmit} disabled={images.length === 0}>
            <Check size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16 }} style={{ flex: 1 }}>
          {isProduct && (
            <View style={{ marginBottom: 16 }}>
              <View style={styles.labelContainer}>
                <Text style={styles.label}>Product Name</Text>
                <Text style={[styles.label, { color: theme.error }]}>*</Text>
              </View>
              <TextInput
                value={formData.title}
                onChangeText={(text) => handleChange('title', text)}
                placeholder="Add a product name"
                placeholderTextColor={theme.textSecondary}
                style={styles.input}
              />
            </View>
          )}

          <View style={{ marginBottom: 16 }}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>{isProduct ? 'Description' : 'Caption'}</Text>
              {isProduct && <Text style={[styles.label, { color: theme.error }]}>*</Text>}
            </View>
            <TextInput
              value={formData.description}
              onChangeText={(text) => handleChange('description', text)}
              placeholder={isProduct ? 'Add a description' : 'Add a caption'}
              multiline
              placeholderTextColor={theme.textSecondary}
              style={[styles.input, { height: 100 }]}
            />
          </View>

          {isProduct && (
            <View style={{ marginBottom: 16 }}>
              <View style={styles.labelContainer}>
                <Text style={styles.label}>Price (BDT)</Text>
                <Text style={[styles.label, { color: theme.error }]}>*</Text>
              </View>
              <TextInput
                value={formData.price}
                onChangeText={(text) => handleChange('price', text)}
                placeholder="Add a price"
                keyboardType="numeric"
                style={styles.input}
              />
            </View>
          )}

          {isProduct && (
            <View style={{ marginBottom: 16 }}>
              <View style={styles.labelContainer}>
                <Text style={styles.label}>Category</Text>
                <Text style={[styles.label, { color: theme.error }]}>*</Text>
              </View>
              <CategorySelector
                selected={formData.category}
                onSelect={(updated) => handleChange('category', updated)}
              />
            </View>
          )}
        </ScrollView>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              isSubmitting && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? null : <Plus size={20} color='#000' />}
            <Text style={[styles.submitButtonText, isSubmitting && styles.submitButtonTextDisabled]}>
              {isSubmitting
                ? 'Creating...'
                : `Create ${contentType === 'post' ? 'Post' : 'Product'}`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
