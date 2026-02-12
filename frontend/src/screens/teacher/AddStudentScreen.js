import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import api from '../../services/api';
import colors from '../../constants/colors';
import { PremiumInput, PremiumButton } from '../../components/PremiumComponents';

const AddStudentScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState(''); // Backend uses mobile as ID
  const [password, setPassword] = useState('123456'); // Default password
  const [studentClass, setStudentClass] = useState('');
  const [srNo, setSrNo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddStudent = async () => {
    if (!name || !mobile || !studentClass || !srNo) {
      Alert.alert('Missing Details', 'Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      // Backend Endpoint: /teacher/add-student
      await api.post('/teacher/add-student', {
        name,
        mobile,
        password,
        class: studentClass,
        srNo
      });

      Alert.alert('Success', 'Student added successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      const msg = error.response?.data?.message || 'Could not add student.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Student</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Student Details</Text>
          
          <PremiumInput
            value={name}
            onChangeText={setName}
            placeholder="Full Name"
            icon="user"
          />

          <PremiumInput
            value={mobile}
            onChangeText={setMobile}
            placeholder="Mobile Number (Login ID)"
            keyboardType="phone-pad"
            icon="smartphone"
          />

          <PremiumInput
            value={studentClass}
            onChangeText={setStudentClass}
            placeholder="Class (e.g., 10th-A)"
            icon="layers"
          />

          <PremiumInput
            value={srNo}
            onChangeText={setSrNo}
            placeholder="Roll Number / SR No."
            icon="hash"
          />

          <PremiumInput
            value={password}
            onChangeText={setPassword}
            placeholder="Set Password"
            icon="lock"
          />

          <View style={{ marginTop: 20 }}>
            <PremiumButton 
              title="Add Student" 
              onPress={handleAddStudent} 
              loading={loading}
              color={colors.primary} 
            />
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.white,
    ...colors.shadow, // Slight shadow for header
    zIndex: 10,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  scrollContent: {
    padding: 20,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
    ...colors.shadow,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.secondary,
    marginBottom: 24,
    textAlign: 'center',
  }
});

export default AddStudentScreen;