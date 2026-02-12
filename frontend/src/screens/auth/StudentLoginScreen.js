import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';
import colors from '../../constants/colors';
import { PremiumInput, PremiumButton } from '../../components/PremiumComponents';

const StudentLoginScreen = ({ navigation }) => {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!mobile || !password) {
      Alert.alert('Missing Fields', 'Please enter your mobile number and password.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/student/login', { mobile, password });
      const { token, name, _id, srNo, class: studentClass } = response.data;

      await AsyncStorage.multiSet([
        ['userToken', token],
        ['userRole', 'Student'],
        ['userName', name],
        ['userId', _id],
        ['studentClass', studentClass]
      ]);

      setLoading(false);
      navigation.replace('StudentHome'); 

    } catch (error) {
      setLoading(false);
      const msg = error.response?.data?.message || 'Login failed. Check your credentials.';
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
          <Text style={styles.headerTitle}>Student Login</Text>
          <Text style={styles.headerSubtitle}>Enter your classroom</Text>
        </View>

        <View style={styles.formContainer}>
          <PremiumInput
            value={mobile}
            onChangeText={setMobile}
            placeholder="Mobile Number"
            keyboardType="phone-pad"
            icon="smartphone"  // <--- ADDED ICON
          />
          
          <PremiumInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry={true}
            icon="lock"       // <--- ADDED ICON
          />

          <View style={{ marginTop: 24 }}>
            <PremiumButton 
              title="Enter Class" 
              onPress={handleLogin} 
              loading={loading}
              color={colors.secondary} // Green Theme
            />
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.footerLink}>← Back to Role Selection</Text>
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
    ...colors.shadow,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
  },
  footerLink: {
    color: colors.secondary, // Green Text
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default StudentLoginScreen;