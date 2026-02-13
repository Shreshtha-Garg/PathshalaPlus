import React, { useState } from 'react';
import { View, ScrollView, Alert, Text, StyleSheet } from 'react-native';
import api from '../../../services/api';
import colors from '../../../constants/colors';
import MainLayout from '../../../components/MainLayout';
import { PremiumInput, PremiumButton, PremiumSelect } from '../../../components/PremiumComponents';

const AddTeacherScreen = ({ navigation }) => {
  const [form, setForm] = useState({ name: '', email: '', password: '', mobile: '', role: 'Teacher' });
  const [errors, setErrors] = useState({}); // Track errors for red borders
  const [loading, setLoading] = useState(false);

  const validate = () => {
    let newErrors = {};
    let isValid = true;

    // 1. Name Validation
    if (!form.name.trim()) {
      newErrors.name = true;
      isValid = false;
    }

    // 2. Email Validation (Regex)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim() || !emailRegex.test(form.email)) {
      newErrors.email = true;
      isValid = false;
    }

    // 3. Mobile Validation (10 digits)
    if (!form.mobile.trim() || form.mobile.length !== 10) {
      newErrors.mobile = true;
      isValid = false;
    }

    // 4. Password Validation
    if (!form.password.trim()) {
      newErrors.password = true;
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleCreate = async () => {
    if (!validate()) {
      Alert.alert("Validation Error", "Please fill all required fields correctly.");
      return;
    }

    setLoading(true);
    try {
      await api.post('/teacher/create-teacher', form);
      Alert.alert("Success", "Teacher account created successfully!", [
          { text: "OK", onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Failed to create teacher.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout title="Add Faculty" navigation={navigation} showBack={true}>
      <ScrollView contentContainerStyle={styles.container}>
        
        <Text style={styles.subtitle}>Create a new account for a staff member.</Text>

        <View style={styles.card}>
            <PremiumInput 
                label="Full Name *" 
                value={form.name} 
                onChangeText={t => { setForm({...form, name: t}); if(errors.name) setErrors({...errors, name: false}); }} 
                icon="user" 
                placeholder="e.g. John Doe"
                hasError={errors.name}
            />
            <PremiumInput 
                label="Email Address *" 
                value={form.email} 
                onChangeText={t => { setForm({...form, email: t}); if(errors.email) setErrors({...errors, email: false}); }} 
                icon="mail" 
                placeholder="teacher@school.com" 
                keyboardType="email-address"
                hasError={errors.email}
            />
            <PremiumInput 
                label="Mobile Number *" 
                value={form.mobile} 
                onChangeText={t => { setForm({...form, mobile: t}); if(errors.mobile) setErrors({...errors, mobile: false}); }} 
                icon="smartphone" 
                maxLength={10} 
                type="numeric" 
                placeholder="10-digit mobile"
                hasError={errors.mobile}
            />
            <PremiumInput 
                label="Password *" 
                value={form.password} 
                onChangeText={t => { setForm({...form, password: t}); if(errors.password) setErrors({...errors, password: false}); }} 
                icon="lock" 
                secureTextEntry={true} 
                placeholder="Set a temporary password"
                hasError={errors.password}
            />
            
            <PremiumSelect 
                label="Access Role" 
                value={form.role} 
                options={['Teacher', 'Admin']} 
                onSelect={val => setForm({...form, role: val})} 
                icon="shield"
            />
        </View>

        <View style={styles.buttonContainer}>
            <PremiumButton title="Create Account" onPress={handleCreate} loading={loading} color={colors.primary} />
        </View>

      </ScrollView>
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  subtitle: { fontSize: 14, color: colors.text.secondary, marginBottom: 20, marginLeft: 5 },
  card: { backgroundColor: colors.white, borderRadius: 20, padding: 20, ...colors.shadow },
  buttonContainer: { marginTop: 30 }
});

export default AddTeacherScreen;