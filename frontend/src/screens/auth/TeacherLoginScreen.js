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

const TeacherLoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ✅ AUTO-FILL CREDENTIALS ONLY (NO AUTO-LOGIN)
  useEffect(() => {
    const fillSavedCredentials = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem('savedEmail');
        const savedPass = await AsyncStorage.getItem('savedPass');

        if (savedEmail) setEmail(savedEmail);
        if (savedPass) setPassword(savedPass);
      } catch (e) {
        console.log('Credential restore error:', e);
      }
    };
    fillSavedCredentials();
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please enter both email and password.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/teacher/login', { 
        email: email.trim().toLowerCase(), 
        password 
      });

      const { token, name, _id } = response.data;

      // ✅ SAVE SESSION + CREDENTIALS
      await AsyncStorage.multiSet([
        ['userToken', token],
        ['userRole', 'Teacher'],
        ['userName', name],
        ['userId', _id],
        ['savedEmail', email.trim().toLowerCase()],
        ['savedPass', password]
      ]);

      setLoading(false);
      navigation.replace('TeacherRoot');

    } catch (error) {
      setLoading(false);
      const msg = error.response?.data?.message || 'Invalid credentials.';
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
            <View style={styles.iconContainer}>
              <Feather name="briefcase" size={32} color={colors.primary} />
            </View>
            <Text style={styles.headerTitle}>Teacher Login</Text>
            <Text style={styles.headerSubtitle}>
              Access your dashboard and manage students
            </Text>
          </View>

          <View style={styles.formContainer}>
            <PremiumInput
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              placeholder="teacher@school.com"
              icon="mail"
              keyboardType="email-address"
              autoCapitalize="none"
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

            <View style={styles.actionRow}>
              <TouchableOpacity>
                <Text style={styles.forgotPassText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            <PremiumButton 
              title="Sign In" 
              onPress={handleLogin} 
              loading={loading}
              color={colors.primary}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity 
              onPress={() => Alert.alert(
                'Admin Access Required', 
                'Please contact your school administration to get teacher credentials.'
              )}
            >
              <Text style={styles.footerLink}>Contact Admin</Text>
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
    width: 72, height: 72, borderRadius: 20, backgroundColor: colors.white,
    justifyContent: 'center', alignItems: 'center', marginBottom: 20, ...colors.cardShadow,
  },
  headerTitle: { fontSize: 32, fontWeight: '800', color: colors.text.primary, marginBottom: 8 },
  headerSubtitle: { fontSize: 15, color: colors.text.secondary, textAlign: 'center' },
  formContainer: { backgroundColor: colors.white, padding: 24, borderRadius: 20, ...colors.cardShadow },
  passwordContainer: { position: 'relative' },
  eyeIcon: { position: 'absolute', right: 16, top: 46 },
  actionRow: { alignItems: 'flex-end', marginBottom: 24, marginTop: -8 },
  forgotPassText: { color: colors.primary, fontSize: 14, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  footerText: { color: colors.text.secondary },
  footerLink: { color: colors.primary, fontWeight: '700' },
});

export default TeacherLoginScreen;
