import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, KeyboardAvoidingView, Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import api from '../../services/api';
import colors from '../../constants/colors';
import { 
  PremiumInput, PremiumDatePicker, PremiumSelect, PremiumButton 
} from '../../components/PremiumComponents';

const EditStudentScreen = ({ route, navigation }) => {
  // Catch the student data passed from the Details screen
  const { student } = route.params;

  // Initialize state with the existing student data
  const [formData, setFormData] = useState({
    // Academic
    srNo: student.srNo || '',
    name: student.name || '',
    mobile: student.mobile || '',
    class: student.class || '',
    
    // Parents
    fatherName: student.fatherName || '',
    fatherAadharNo: student.fatherAadharNo || '',
    motherName: student.motherName || '',
    motherAadharNo: student.motherAadharNo || '',
    
    // Personal
    dob: student.dob || '',
    address: student.address || '',
    aadharNo: student.aadharNo || '',
    category: student.category || 'Gen',
    
    // Ration Card
    rationCardType: student.rationCardType || 'None',
    rationCardNo: student.rationCardNo || '',
    
    // Bank (Optional)
    bankName: student.bankName || '',
    bankAccountNo: student.bankAccountNo || '',
    bankIfsc: student.bankIfsc || '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Update form field
  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: false }));
    }
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};

    // 1. Academic (Required)
    if (!formData.srNo.trim()) newErrors.srNo = true;
    if (!formData.name.trim()) newErrors.name = true;
    if (!formData.mobile.trim()) newErrors.mobile = true;
    if (!formData.class) newErrors.class = true;

    // 2. Parents (Required)
    if (!formData.fatherName.trim()) newErrors.fatherName = true;
    if (!formData.fatherAadharNo.trim()) newErrors.fatherAadharNo = true;
    if (!formData.motherName.trim()) newErrors.motherName = true;
    if (!formData.motherAadharNo.trim()) newErrors.motherAadharNo = true;

    // 3. Personal (Required)
    if (!formData.dob) newErrors.dob = true;
    if (!formData.address.trim()) newErrors.address = true;
    if (!formData.aadharNo.trim()) newErrors.aadharNo = true;
    if (!formData.category) newErrors.category = true;

    // 4. Ration Card Logic
    if (!formData.rationCardType) {
        newErrors.rationCardType = true;
    } else if (formData.rationCardType !== 'None' && !formData.rationCardNo.trim()) {
        newErrors.rationCardNo = true;
    }

    // --- Format Checks ---

    // Mobile validation (10 digits)
    if (formData.mobile && formData.mobile.length !== 10) {
      newErrors.mobile = true;
      Alert.alert('Invalid Mobile', 'Mobile number must be exactly 10 digits.');
      return false;
    }

    // Aadhar validation (12 digits)
    if (formData.aadharNo && formData.aadharNo.length !== 12) {
      newErrors.aadharNo = true;
      Alert.alert('Invalid Aadhar', 'Student Aadhar number must be exactly 12 digits.');
      return false;
    }
    if (formData.fatherAadharNo && formData.fatherAadharNo.length !== 12) {
      newErrors.fatherAadharNo = true;
      Alert.alert('Invalid Aadhar', 'Father\'s Aadhar must be 12 digits.');
      return false;
    }
    if (formData.motherAadharNo && formData.motherAadharNo.length !== 12) {
      newErrors.motherAadharNo = true;
      Alert.alert('Invalid Aadhar', 'Mother\'s Aadhar must be 12 digits.');
      return false;
    }

    // IFSC validation (11 characters) - Only if filled
    if (formData.bankIfsc && formData.bankIfsc.length > 0 && formData.bankIfsc.length !== 11) {
      newErrors.bankIfsc = true;
      Alert.alert('Invalid IFSC', 'IFSC code must be exactly 11 characters.');
      return false;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      Alert.alert('Missing Fields', 'Please fill all required fields correctly.');
      return false;
    }

    return true;
  };

  // Submit
  const handleUpdate = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await api.put(`/teacher/edit-student/${student._id}`, formData);
      
      Alert.alert(
        'Success!',
        'Student details updated successfully.',
        [{ text: 'OK', onPress: () => {
          // ✅ FIX: Go back to StudentDetails with updated student data
          navigation.navigate('StudentDetails', { 
            student: { ...student, ...formData } 
          });
        }}]
      );

    } catch (error) {
      setLoading(false);
      const msg = error.response?.data?.message || 'Failed to update student. Please try again.';
      Alert.alert('Error', msg);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Details</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >

          {/* Section 1: Academic Information */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <Feather name="book" size={20} color={colors.primary} />
              </View>
              <Text style={styles.sectionTitle}>Academic Information</Text>
            </View>

            <PremiumInput label="SR Number *" value={formData.srNo} onChangeText={(val) => updateField('srNo', val)} placeholder="e.g., 2024001" icon="hash" type="numeric" hasError={errors.srNo} />
            <PremiumInput label="Full Name *" value={formData.name} onChangeText={(val) => updateField('name', val)} placeholder="Enter student name" icon="user" type="name" hasError={errors.name} />
            <PremiumInput label="Mobile Number *" value={formData.mobile} onChangeText={(val) => updateField('mobile', val)} placeholder="10-digit mobile" icon="phone" type="numeric" maxLength={10} hasError={errors.mobile} />
            <PremiumSelect label="Class *" value={formData.class} onSelect={(val) => updateField('class', val)} placeholder="Select class" icon="book-open" options={['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']} hasError={errors.class} />
          </View>

          {/* Section 2: Parent Information */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <Feather name="users" size={20} color={colors.secondary} />
              </View>
              <Text style={styles.sectionTitle}>Parent Information</Text>
            </View>

            <PremiumInput label="Father's Name *" value={formData.fatherName} onChangeText={(val) => updateField('fatherName', val)} placeholder="Enter father's name" icon="user" type="name" hasError={errors.fatherName} />
            <PremiumInput label="Father's Aadhar *" value={formData.fatherAadharNo} onChangeText={(val) => updateField('fatherAadharNo', val)} placeholder="12-digit Aadhar" icon="credit-card" type="numeric" maxLength={12} hasError={errors.fatherAadharNo} />
            <PremiumInput label="Mother's Name *" value={formData.motherName} onChangeText={(val) => updateField('motherName', val)} placeholder="Enter mother's name" icon="user" type="name" hasError={errors.motherName} />
            <PremiumInput label="Mother's Aadhar *" value={formData.motherAadharNo} onChangeText={(val) => updateField('motherAadharNo', val)} placeholder="12-digit Aadhar" icon="credit-card" type="numeric" maxLength={12} hasError={errors.motherAadharNo} />
          </View>

          {/* Section 3: Personal Details */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <Feather name="info" size={20} color={colors.cardIndigo || '#5c6bc0'} />
              </View>
              <Text style={styles.sectionTitle}>Personal Details</Text>
            </View>

            <PremiumDatePicker label="Date of Birth *" value={formData.dob} onSelect={(val) => updateField('dob', val)} placeholder="Select date" hasError={errors.dob} />
            <PremiumInput label="Address *" value={formData.address} onChangeText={(val) => updateField('address', val)} placeholder="Enter full address" icon="map-pin" hasError={errors.address} />
            <PremiumInput label="Student's Aadhar *" value={formData.aadharNo} onChangeText={(val) => updateField('aadharNo', val)} placeholder="12-digit Aadhar" icon="credit-card" type="numeric" maxLength={12} hasError={errors.aadharNo} />
            <PremiumSelect label="Category *" value={formData.category} onSelect={(val) => updateField('category', val)} placeholder="Select category" icon="tag" options={['Gen', 'SC', 'ST', 'OBC', 'EWS']} hasError={errors.category} />
            <PremiumSelect label="Ration Card Type *" value={formData.rationCardType} onSelect={(val) => updateField('rationCardType', val)} placeholder="Select type" icon="file-text" options={['APL', 'BPL', 'Antyodaya', 'Annapurna', 'Priority', 'None']} hasError={errors.rationCardType} />

            {formData.rationCardType && formData.rationCardType !== 'None' && (
              <PremiumInput label="Ration Card Number *" value={formData.rationCardNo} onChangeText={(val) => updateField('rationCardNo', val)} placeholder="Enter ration card number" icon="file-text" hasError={errors.rationCardNo} />
            )}
          </View>

          {/* Section 4: Bank Details (Optional) */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <Feather name="dollar-sign" size={20} color={colors.warning} />
              </View>
              <Text style={styles.sectionTitle}>Bank Details (Optional)</Text>
            </View>

            <PremiumInput label="Bank Name" value={formData.bankName} onChangeText={(val) => updateField('bankName', val)} placeholder="Enter bank name" icon="home" />
            <PremiumInput label="Account Number" value={formData.bankAccountNo} onChangeText={(val) => updateField('bankAccountNo', val)} placeholder="Enter account number" icon="credit-card" type="numeric" />
            <PremiumInput label="IFSC Code" value={formData.bankIfsc} onChangeText={(val) => updateField('bankIfsc', val)} placeholder="11-character IFSC" icon="hash" type="ifsc" maxLength={11} hasError={errors.bankIfsc} />
          </View>

          {/* Submit Button */}
          <View style={styles.buttonContainer}>
            <PremiumButton title="Save Changes" onPress={handleUpdate} loading={loading} color={colors.primary} />
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  keyboardView: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16, backgroundColor: colors.white,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backButton: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: colors.text.primary },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  section: {
    backgroundColor: colors.white, borderRadius: 20, padding: 20,
    marginBottom: 20, ...colors.cardShadow,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  sectionIconContainer: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: colors.background,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text.primary },
  buttonContainer: { marginTop: 10, marginBottom: 20 },
});

export default EditStudentScreen;