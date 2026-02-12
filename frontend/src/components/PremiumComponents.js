import React from 'react';
import { 
  TextInput, TouchableOpacity, Text, StyleSheet, View, ActivityIndicator 
} from 'react-native';
import { Feather } from '@expo/vector-icons'; // <--- IMPORTED PREMIUM ICONS
import colors from '../constants/colors';

// --- 1. Premium Input (Now with Icon Support) ---
export const PremiumInput = ({ 
  value, onChangeText, placeholder, secureTextEntry, keyboardType, icon 
}) => {
  return (
    <View style={styles.inputContainer}>
      {/* If an icon name is passed, show it */}
      {icon && (
        <Feather name={icon} size={20} color={colors.text.secondary} style={styles.inputIcon} />
      )}
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.text.secondary}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
      />
    </View>
  );
};

// --- 2. Button (Unchanged, just kept for context) ---
export const PremiumButton = ({ onPress, title, color, loading }) => {
  return (
    <TouchableOpacity 
      style={[styles.button, { backgroundColor: color || colors.primary }]} 
      onPress={onPress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <Text style={styles.buttonText}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

// --- 3. Dashboard Card (Replaced Emoji with Icon) ---
export const DashboardCard = ({ title, icon, color, onPress, fullWidth }) => {
  return (
    <TouchableOpacity 
      style={[
        styles.card, 
        { backgroundColor: color, width: fullWidth ? '100%' : '48%' }
      ]} 
      onPress={onPress}
    >
      {/* <--- CHANGED THIS LINE: Uses Feather Icon now */}
      <Feather name={icon} size={32} color={colors.white} />
      <Text style={styles.cardTitle}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 20,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 15,
    height: 55,
    flexDirection: 'row', // Aligns icon and text
    alignItems: 'center',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
  },
  button: {
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    ...colors.shadow,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  card: {
    height: 140,
    borderRadius: 16,
    padding: 20,
    justifyContent: 'space-between',
    marginBottom: 15,
    ...colors.shadow,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  }
});