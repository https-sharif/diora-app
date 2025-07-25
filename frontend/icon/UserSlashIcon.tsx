import React from 'react';
import { View, StyleSheet } from 'react-native';
import { User, Slash } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

export default function UserSlashIcon({ size = 40 }: { size?: number }) {
  const { theme } = useTheme();

  return (
    <View style={{ width: size, height: size, position: 'relative' }}>
      <User size={size} color={theme.text} />
      <Slash size={size} color={theme.card} strokeWidth={5} style={StyleSheet.absoluteFill} />
      <Slash size={size} color={theme.text} style={StyleSheet.absoluteFill} />
    </View>
  );
}
