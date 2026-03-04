import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, Alert, 
  KeyboardAvoidingView, Platform, ScrollView 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';
import colors from '../../constants/colors';
import { PremiumInput, PremiumButton } from '../../components/PremiumComponents';

const StudentLoginScreen = ({ navigation }) => {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Auto-fill saved credentials
  useEffect(() => {
    const fillSavedCredentials = async () => {
      try {
        const savedMobile = await AsyncStorage.getItem('savedStudentMobile');
        if (savedMobile) setMobile(savedMobile);
      } catch (e) {
        console.log('Credential restore error:', e);
      }
    };
    fillSavedCredentials();
  }, []);

  const handleLogin = async () => {
    if (!mobile.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please enter both mobile number and password.');
      return;
    }

    if (mobile.trim().length !== 10) {
      Alert.alert('Invalid Mobile', 'Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/student/login', { 
        mobile: mobile.trim(), 
        password 
      });

      const { token, name, _id, studentClass, mobile:serverMobile } = response.data;
      // Save Session + Credentials
      await AsyncStorage.multiSet([
        ['userToken', token],
        ['userRole', 'Student'],
        ['userName', name],
        ['userId', _id],
        ['studentClass', studentClass || ''], 
        ['savedStudentMobile', mobile.trim()],
        ['userMobile', serverMobile || mobile.trim()],
      ]);

      setLoading(false);
      navigation.replace('StudentRoot');

    } catch (error) {
      setLoading(false);
      const msg = error.response?.data?.message || 'Invalid credentials.';
      console.error('Login Error:', error);
      Alert.alert('Login Failed', msg);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Feather name="arrow-left" size={24} color={colors.text.primary} />
          </TouchableOpacity>

          <View style={styles.headerContainer}>
            <View style={[styles.iconContainer, { backgroundColor: colors.cardIndigo + '15' }]}>
              <Feather name="book-open" size={32} color={colors.cardIndigo} />
            </View>
            <Text style={styles.headerTitle}>Student Login</Text>
            <Text style={styles.headerSubtitle}>
              Access your classes, homework, and updates
            </Text>
          </View>

          <View style={styles.formContainer}>
            <PremiumInput
              label="Mobile Number"
              value={mobile}
              onChangeText={setMobile}
              placeholder="Enter 10-digit mobile number"
              icon="phone"
              type="mobile"
              maxLength={10}
            />

            <View style={styles.passwordContainer}>
              <PremiumInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry={!showPassword}
                icon="lock"
              />
              <TouchableOpacity 
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Feather 
                  name={showPassword ? "eye" : "eye-off"} 
                  size={20} 
                  color={colors.text.secondary} 
                />
              </TouchableOpacity>
            </View>

            <PremiumButton 
              title="Sign In" 
              onPress={handleLogin} 
              loading={loading}
              color={colors.cardIndigo} // Using a different color to distinguish from Teacher login
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Forgot password or need access? </Text>
            <TouchableOpacity onPress={() => Alert.alert('Help', 'Please ask your class teacher to reset your password.')}>
              <Text style={[styles.footerLink, { color: colors.cardIndigo }]}>Ask Teacher</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: 24 },
  backButton: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: colors.white,
    justifyContent: 'center', alignItems: 'center', marginBottom: 24, ...colors.cardShadow,
  },
  headerContainer: { marginBottom: 40, alignItems: 'center' },
  iconContainer: {
    width: 72, height: 72, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center', marginBottom: 20,
  },
  headerTitle: { fontSize: 32, fontWeight: '800', color: colors.text.primary, marginBottom: 8 },
  headerSubtitle: { fontSize: 15, color: colors.text.secondary, textAlign: 'center' },
  formContainer: { backgroundColor: colors.white, padding: 24, borderRadius: 20, ...colors.cardShadow },
  passwordContainer: { position: 'relative', marginBottom: 12 },
  eyeIcon: { position: 'absolute', right: 16, top: 46 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  footerText: { color: colors.text.secondary },
  footerLink: { fontWeight: '700' },
});

export default StudentLoginScreen;