import React, { useState } from 'react';
import { 
  TextInput, TouchableOpacity, Text, StyleSheet, View, ActivityIndicator, Modal, FlatList, Platform 
} from 'react-native';
import { Feather } from '@expo/vector-icons'; 
import DateTimePicker from '@react-native-community/datetimepicker';
import colors from '../constants/colors';

// --- 1. PREMIUM INPUT ---
export const PremiumInput = ({ 
  value, onChangeText, label, placeholder, secureTextEntry, type = 'default', icon, hasError, maxLength 
}) => {
  
  const handleTextChange = (text) => {
    let cleanedText = text;
    if (type === 'numeric') {
      cleanedText = text.replace(/[^0-9]/g, '');
    } 
    else if (type === 'name') {
      cleanedText = text.replace(/[^a-zA-Z\s.\-']/g, '');
    } 
    else if (type === 'ifsc') {
      cleanedText = text.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    }
    onChangeText(cleanedText);
  };

  const getKeyboardType = () => {
    if (type === 'numeric') return 'number-pad';
    return 'default';
  };

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputContainer, hasError && styles.errorBorder]}>
        {icon && (
          <Feather name={icon} size={20} color={hasError ? colors.error : colors.text.secondary} style={styles.inputIcon} />
        )}
        <TextInput
          style={styles.input}
          value={value || ''} // Safety check
          onChangeText={handleTextChange}
          placeholder={placeholder}
          placeholderTextColor={colors.text.secondary}
          secureTextEntry={secureTextEntry}
          keyboardType={getKeyboardType()}
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

  // --- WEB FALLBACK: Just a Text Input for Date ---
  if (Platform.OS === 'web') {
    return (
      <PremiumInput
        label={label}
        value={value}
        onChangeText={onSelect} // Allow manual typing on web
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
      >
        <Feather name="calendar" size={20} color={hasError ? colors.error : colors.text.secondary} style={styles.inputIcon} />
        <Text style={[styles.inputText, !value && { color: colors.text.secondary }]}>
          {value || placeholder}
        </Text>
        <Feather name="chevron-down" size={20} color={colors.text.secondary} style={{ marginLeft: 'auto' }} />
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

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity 
        style={[styles.inputContainer, hasError && styles.errorBorder]} 
        onPress={() => setVisible(true)}
      >
        {icon && (
          <Feather name={icon} size={20} color={hasError ? colors.error : colors.text.secondary} style={styles.inputIcon} />
        )}
        <Text style={[styles.inputText, !value && { color: colors.text.secondary }]}>
          {value || placeholder}
        </Text>
        <Feather name="chevron-down" size={20} color={colors.text.secondary} style={{ marginLeft: 'auto' }} />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setVisible(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select {label}</Text>
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
                >
                  <Text style={styles.optionText}>{item}</Text>
                  {value === item && <Feather name="check" size={18} color={colors.primary} />}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// --- BUTTON & CARD ---
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

export const DashboardCard = ({ title, icon, color, onPress, fullWidth }) => {
  return (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: color, width: fullWidth ? '100%' : '48%' }]} 
      onPress={onPress}
    >
      <Feather name={icon} size={32} color={colors.white} />
      <Text style={styles.cardTitle}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginBottom: 15 },
  label: { fontSize: 14, fontWeight: '600', color: colors.text.primary, marginBottom: 6, marginLeft: 2 },
  inputContainer: {
    backgroundColor: colors.white, borderRadius: 12, borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: 15, height: 55, flexDirection: 'row', alignItems: 'center',
  },
  errorBorder: { borderColor: colors.error, borderWidth: 1.5 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: colors.text.primary, height: '100%' }, // Added height 100%
  inputText: { fontSize: 16, color: colors.text.primary },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: 'white', borderRadius: 16, padding: 20, maxHeight: 400 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: colors.text.primary },
  optionItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', flexDirection: 'row', justifyContent: 'space-between' },
  optionText: { fontSize: 16, color: colors.text.primary },

  button: { height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center', ...colors.shadow },
  buttonText: { color: colors.white, fontSize: 16, fontWeight: 'bold' },
  card: { height: 140, borderRadius: 16, padding: 20, justifyContent: 'space-between', marginBottom: 15, ...colors.shadow },
  cardTitle: { fontSize: 18, fontWeight: '700', color: colors.white }
});