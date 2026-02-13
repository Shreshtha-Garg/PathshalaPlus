import React, { useState, useEffect, useRef } from 'react';
import { 
  TextInput, TouchableOpacity, Text, StyleSheet, View, 
  ActivityIndicator, Modal, FlatList, Platform, Animated 
} from 'react-native';
import { Feather } from '@expo/vector-icons'; 
import DateTimePicker from '@react-native-community/datetimepicker';
import colors from '../constants/colors';

// --- 1. PREMIUM INPUT ---
export const PremiumInput = ({ 
  value, onChangeText, label, placeholder, secureTextEntry, 
  type = 'default', icon, hasError, maxLength, keyboardType, autoCapitalize 
}) => {
  
  const handleTextChange = (text) => {
    let cleanedText = text;
    
    if (type === 'numeric') {
      cleanedText = text.replace(/[^0-9]/g, '');
    } 
    else if (type === 'name') {
      // Allow letters, spaces, dots, hyphens, apostrophes
      cleanedText = text.replace(/[^a-zA-Z\s.\-']/g, '');
    } 
    else if (type === 'ifsc') {
      // Alphanumeric only, uppercase
      cleanedText = text.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    }
    else if (type === 'email') {
      // Remove spaces, lowercase
      cleanedText = text.replace(/\s/g, '').toLowerCase();
    }
    
    onChangeText(cleanedText);
  };

  const getKeyboardType = () => {
    if (keyboardType) return keyboardType;
    if (type === 'numeric') return 'number-pad';
    if (type === 'email') return 'email-address';
    return 'default';
  };

  const getAutoCapitalize = () => {
    if (autoCapitalize) return autoCapitalize;
    if (type === 'email' || type === 'ifsc') return 'none';
    return 'sentences';
  };

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputContainer, hasError && styles.errorBorder]}>
        {icon && (
          <Feather 
            name={icon} 
            size={20} 
            color={hasError ? colors.error : colors.text.secondary} 
            style={styles.inputIcon} 
          />
        )}
        <TextInput
          style={styles.input}
          value={value || ''}
          onChangeText={handleTextChange}
          placeholder={placeholder}
          placeholderTextColor={colors.text.tertiary}
          secureTextEntry={secureTextEntry}
          keyboardType={getKeyboardType()}
          autoCapitalize={getAutoCapitalize()}
          maxLength={maxLength}
          autoComplete="off"
          autoCorrect={false}
        />
      </View>
    </View>
  );
};

// --- 2. PREMIUM DATE PICKER (Web Compatible) ---
export const PremiumDatePicker = ({ value, onSelect, label, placeholder, hasError }) => {
  const [show, setShow] = useState(false);

  // --- WEB FALLBACK: Text Input for Date ---
  if (Platform.OS === 'web') {
    return (
      <PremiumInput
        label={label}
        value={value}
        onChangeText={onSelect}
        placeholder="DD-MM-YYYY"
        icon="calendar"
        hasError={hasError}
        maxLength={10}
      />
    );
  }

  // --- MOBILE: Native Calendar ---
  const onChange = (event, selectedDate) => {
    setShow(false);
    if (selectedDate) {
      const formatted = selectedDate.toLocaleDateString('en-GB').replace(/\//g, '-');
      onSelect(formatted);
    }
  };

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <TouchableOpacity 
        style={[styles.inputContainer, hasError && styles.errorBorder]} 
        onPress={() => setShow(true)}
        activeOpacity={0.7}
      >
        <Feather 
          name="calendar" 
          size={20} 
          color={hasError ? colors.error : colors.text.secondary} 
          style={styles.inputIcon} 
        />
        <Text style={[styles.inputText, !value && { color: colors.text.tertiary }]}>
          {value || placeholder}
        </Text>
        <Feather 
          name="chevron-down" 
          size={20} 
          color={colors.text.secondary} 
          style={{ marginLeft: 'auto' }} 
        />
      </TouchableOpacity>

      {show && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onChange}
          maximumDate={new Date()} 
        />
      )}
    </View>
  );
};


// --- 3. PREMIUM SELECT ---
export const PremiumSelect = ({ 
  value, onSelect, label, placeholder, icon, options, hasError 
}) => {
  const [visible, setVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      slideAnim.setValue(0);
    }
  }, [visible]);

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0],
  });

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity 
        style={[styles.inputContainer, hasError && styles.errorBorder]} 
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
      >
        {icon && (
          <Feather 
            name={icon} 
            size={20} 
            color={hasError ? colors.error : colors.text.secondary} 
            style={styles.inputIcon} 
          />
        )}
        <Text style={[styles.inputText, !value && { color: colors.text.tertiary }]}>
          {value || placeholder}
        </Text>
        <Feather 
          name="chevron-down" 
          size={20} 
          color={colors.text.secondary} 
          style={{ marginLeft: 'auto' }} 
        />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade">
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <Animated.View 
            style={[
              styles.modalContent,
              { transform: [{ translateY }] }
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select {label}</Text>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Feather name="x" size={24} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.optionItem}
                  onPress={() => {
                    onSelect(item);
                    setVisible(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.optionText}>{item}</Text>
                  {value === item && (
                    <Feather name="check" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// --- 4. PREMIUM BUTTON ---
export const PremiumButton = ({ onPress, title, color, loading, variant = 'primary' }) => {
  const buttonColor = variant === 'secondary' ? colors.white : (color || colors.primary);
  const textColor = variant === 'secondary' ? colors.primary : colors.white;
  const borderStyle = variant === 'secondary' ? { borderWidth: 2, borderColor: colors.primary } : {};

  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        { backgroundColor: buttonColor },
        borderStyle,
        loading && { opacity: 0.7 }
      ]} 
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.buttonText, { color: textColor }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

// --- 5. DASHBOARD CARD ---
export const DashboardCard = ({ title, icon, color, onPress, fullWidth, subtitle }) => {
  return (
    <TouchableOpacity 
      style={[
        styles.card, 
        { backgroundColor: color, width: fullWidth ? '100%' : '48%' }
      ]} 
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.cardIconContainer}>
        <Feather name={icon} size={28} color={colors.white} />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{title}</Text>
        {subtitle && <Text style={styles.cardSubtitle}>{subtitle}</Text>}
      </View>
      <View style={styles.cardArrow}>
        <Feather name="arrow-right" size={20} color="rgba(255,255,255,0.8)" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Input Styles
  wrapper: { 
    marginBottom: 18,
  },
  label: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: colors.text.primary, 
    marginBottom: 8, 
    marginLeft: 2 
  },
  inputContainer: {
    backgroundColor: colors.white, 
    borderRadius: 12, 
    borderWidth: 1.5, 
    borderColor: colors.border,
    paddingHorizontal: 16, 
    height: 56, 
    flexDirection: 'row', 
    alignItems: 'center',
  },
  errorBorder: { 
    borderColor: colors.error, 
    borderWidth: 2 
  },
  inputIcon: { 
    marginRight: 12 
  },
  input: { 
    flex: 1, 
    fontSize: 16, 
    color: colors.text.primary, 
    height: '100%',
    paddingTop: 0,
    paddingBottom: 0,
  },
  inputText: { 
    flex: 1,
    fontSize: 16, 
    color: colors.text.primary 
  },
  
  // Modal Styles
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'flex-end',
  },
  modalContent: { 
    backgroundColor: colors.white, 
    borderTopLeftRadius: 24, 
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  modalTitle: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: colors.text.primary 
  },
  optionItem: { 
    paddingVertical: 16,
    paddingHorizontal: 20, 
    borderBottomWidth: 1, 
    borderBottomColor: colors.divider, 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionText: { 
    fontSize: 16, 
    color: colors.text.primary,
    fontWeight: '500',
  },

  // Button Styles
  button: { 
    height: 56, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center', 
    ...colors.buttonShadow 
  },
  buttonText: { 
    fontSize: 16, 
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  
  // Card Styles
  card: { 
    height: 140, 
    borderRadius: 20, 
    padding: 20, 
    marginBottom: 16,
    ...colors.shadow,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    marginLeft: 16,
  },
  cardTitle: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: colors.white,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  cardArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default { PremiumInput, PremiumDatePicker, PremiumSelect, PremiumButton, DashboardCard };