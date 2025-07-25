import React from 'react';
import { View } from 'react-native';
import { ImageOff } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

export default function ImageSlashIcon({ size = 40 }: { size?: number }) {
  const { theme } = useTheme();

  return (
    <View style={{ width: size, height: size, position: 'relative' }}>
      <ImageOff size={size} color={theme.text} />
    </View>
  );
}
