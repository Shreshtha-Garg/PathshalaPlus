import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';
import colors from '../../constants/colors';
import { PremiumInput, PremiumButton } from '../../components/PremiumComponents';

const TeacherLoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/teacher/login', { email, password });
      const { token, name, _id } = response.data;
      
      await AsyncStorage.multiSet([
        ['userToken', token],
        ['userRole', 'Teacher'],
        ['userName', name],
        ['userId', _id]
      ]);

      setLoading(false);
      navigation.replace('TeacherHome'); 

    } catch (error) {
      setLoading(false);
      const msg = error.response?.data?.message || 'Something went wrong. Please try again.';
      Alert.alert('Login Failed', msg);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={styles.keyboardView}
      >
        
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Teacher Login</Text>
          <Text style={styles.headerSubtitle}>Access your dashboard</Text>
        </View>

        <View style={styles.formContainer}>
          <PremiumInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email Address"
            keyboardType="email-address"
            icon="mail"   // <--- ADDED ICON
          />
          
          <PremiumInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry={true}
            icon="lock"   // <--- ADDED ICON
          />

          <TouchableOpacity style={styles.forgotPassContainer}>
            <Text style={styles.forgotPassText}>Forgot Password?</Text>
          </TouchableOpacity>

          <View style={{ marginTop: 20 }}>
            <PremiumButton 
              title="Sign In" 
              onPress={handleLogin} 
              loading={loading}
              color={colors.primary}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => Alert.alert('Admin Access', 'Please contact school administration.')}>
            <Text style={styles.footerLink}>Contact Admin</Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  headerContainer: {
    marginBottom: 40,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 10,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  formContainer: {
    backgroundColor: colors.white,
    padding: 24,
    borderRadius: 24,
    ...colors.shadow, // Soft card shadow
  },
  forgotPassContainer: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  forgotPassText: {
    color: colors.text.secondary,
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
  },
  footerText: {
    color: colors.text.secondary,
    fontSize: 15,
  },
  footerLink: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default TeacherLoginScreen;