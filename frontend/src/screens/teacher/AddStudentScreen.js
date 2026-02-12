import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import api from '../../services/api';
import colors from '../../constants/colors';
import { PremiumInput, PremiumButton, PremiumSelect, PremiumDatePicker } from '../../components/PremiumComponents';
import MainLayout from '../../components/MainLayout';

const AddStudentScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [formData, setFormData] = useState({
    name: '', mobile: '', class: '', srNo: '',
    fatherName: '', fatherAadharNo: '',
    motherName: '', motherAadharNo: '',
    dob: '', address: '', aadharNo: '',
    category: '', rationCardType: '', rationCardNo: '',
    bankName: '', bankAccountNo: '', bankIfsc: ''
  });

  const [errors, setErrors] = useState({});

  const CATEGORY_OPTIONS = ['Gen', 'SC', 'ST', 'OBC', 'EWS'];
  const RATION_OPTIONS = ['APL', 'BPL', 'Antyodaya', 'Annapurna', 'Priority', 'None'];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: false }));
    setSubmitError('');
  };

  const handleAddStudent = async () => {
    let newErrors = {};
    let errorMsg = '';

    const requiredFields = [
      'name', 'mobile', 'class', 'srNo', 
      'fatherName', 'motherName', 'address', 'aadharNo',
      'fatherAadharNo', 'motherAadharNo', 'dob',
      'category', 'rationCardType'
    ];

    requiredFields.forEach(field => {
      if (!formData[field]) newErrors[field] = true;
    });

    if (formData.rationCardType && formData.rationCardType !== 'None' && !formData.rationCardNo) {
      newErrors['rationCardNo'] = true;
    }

    // STRICT LENGTH CHECKS
    if (formData.mobile && formData.mobile.length !== 10) {
      newErrors['mobile'] = true;
      errorMsg = 'Mobile number must be exactly 10 digits.';
    }
    if (formData.aadharNo && formData.aadharNo.length !== 12) {
      newErrors['aadharNo'] = true;
      errorMsg = 'Student Aadhar must be exactly 12 digits.';
    }
    if (formData.fatherAadharNo && formData.fatherAadharNo.length !== 12) {
      newErrors['fatherAadharNo'] = true;
      errorMsg = 'Father Aadhar must be exactly 12 digits.';
    }
    if (formData.motherAadharNo && formData.motherAadharNo.length !== 12) {
      newErrors['motherAadharNo'] = true;
      errorMsg = 'Mother Aadhar must be exactly 12 digits.';
    }
    if (formData.bankIfsc && formData.bankIfsc.length !== 11) {
      newErrors['bankIfsc'] = true;
      errorMsg = 'IFSC Code must be exactly 11 characters.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSubmitError(errorMsg || 'Please fill the required fields correctly.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/teacher/add-student', {
        ...formData,
        password: '123456'
      });

      setFormData({
        name: '', mobile: '', class: '', srNo: '',
        fatherName: '', fatherAadharNo: '',
        motherName: '', motherAadharNo: '',
        dob: '', address: '', aadharNo: '',
        category: '', rationCardType: '', rationCardNo: '',
        bankName: '', bankAccountNo: '', bankIfsc: ''
      });
      setSubmitError('Success! Student admitted.'); 

    } catch (error) {
      setSubmitError(error.response?.data?.message || 'Could not add student.');
    } finally {
      setLoading(false);
    }
  };

  const SectionHeader = ({ title }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.divider} />
    </View>
  );

  return (
    <MainLayout title="New Admission" navigation={navigation} showBack={true}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* --- ACADEMIC INFO --- */}
        <SectionHeader title="Academic Info" />
        <View style={styles.card}>
          <PremiumInput 
            label="Full Name *" type="name" 
            placeholder="Enter Student Name" icon="user" 
            value={formData.name} onChangeText={t => handleChange('name', t)} 
            hasError={errors.name}
          />
          <PremiumInput 
            label="SR / Roll No. *" type="default" 
            placeholder="Enter Roll No." icon="hash" 
            value={formData.srNo} onChangeText={t => handleChange('srNo', t)} 
            hasError={errors.srNo}
          />
          <PremiumInput 
            label="Class *" type="default"
            placeholder="e.g. 10th-A" icon="book-open" 
            value={formData.class} onChangeText={t => handleChange('class', t)} 
            hasError={errors.class}
          />
          <PremiumInput 
            label="Mobile Number *" type="numeric" 
            placeholder="10 Digit Mobile No." icon="smartphone" 
            value={formData.mobile} onChangeText={t => handleChange('mobile', t)} 
            maxLength={10} hasError={errors.mobile}
          />
        </View>

        {/* --- PARENTS DETAILS --- */}
        <SectionHeader title="Parents Info" />
        <View style={styles.card}>
          <PremiumInput 
            label="Father's Name *" type="name"
            placeholder="Enter Father's Name" icon="user" 
            value={formData.fatherName} onChangeText={t => handleChange('fatherName', t)} 
            hasError={errors.fatherName}
          />
          <PremiumInput 
            label="Father's Aadhar *" type="numeric"
            placeholder="12 Digit Aadhar" icon="shield" 
            value={formData.fatherAadharNo} onChangeText={t => handleChange('fatherAadharNo', t)} 
            maxLength={12} hasError={errors.fatherAadharNo}
          />
          <PremiumInput 
            label="Mother's Name *" type="name"
            placeholder="Enter Mother's Name" icon="user" 
            value={formData.motherName} onChangeText={t => handleChange('motherName', t)} 
            hasError={errors.motherName}
          />
           <PremiumInput 
            label="Mother's Aadhar *" type="numeric"
            placeholder="12 Digit Aadhar" icon="shield" 
            value={formData.motherAadharNo} onChangeText={t => handleChange('motherAadharNo', t)} 
            maxLength={12} hasError={errors.motherAadharNo}
          />
        </View>

        {/* --- PERSONAL & OFFICIAL --- */}
        <SectionHeader title="Personal & Official" />
        <View style={styles.card}>
          <PremiumDatePicker 
            label="Date of Birth *" placeholder="Select Date" 
            value={formData.dob} onSelect={val => handleChange('dob', val)}
            hasError={errors.dob}
          />
          
          <PremiumInput 
            label="Student Aadhar *" type="numeric"
            placeholder="12 Digit Aadhar" icon="shield" 
            value={formData.aadharNo} onChangeText={t => handleChange('aadharNo', t)} 
            maxLength={12} hasError={errors.aadharNo}
          />
          
          <PremiumInput 
            label="Residential Address *" type="default"
            placeholder="Full Address" icon="map-pin" 
            value={formData.address} onChangeText={t => handleChange('address', t)} 
            hasError={errors.address}
          />
          
          <PremiumSelect 
            label="Category *" placeholder="Select Category" icon="grid" // Better icon
            options={CATEGORY_OPTIONS}
            value={formData.category} onSelect={val => handleChange('category', val)}
            hasError={errors.category}
          />
          
          <PremiumSelect 
            label="Ration Card Type *" placeholder="Select Type" icon="credit-card"
            options={RATION_OPTIONS}
            value={formData.rationCardType} onSelect={val => handleChange('rationCardType', val)}
            hasError={errors.rationCardType}
          />

          {formData.rationCardType && formData.rationCardType !== 'None' && (
            <PremiumInput 
              label="Ration Card No *" type="default"
              placeholder="Enter Ration Card No" icon="hash"
              value={formData.rationCardNo} onChangeText={t => handleChange('rationCardNo', t)} 
              hasError={errors.rationCardNo}
            />
          )}
        </View>

        {/* --- BANK DETAILS --- */}
        <SectionHeader title="Bank Details (Optional)" />
        <View style={styles.card}>
          <PremiumInput 
            label="Bank Name" type="default"
            placeholder="Bank Name" icon="dollar-sign" 
            value={formData.bankName} onChangeText={t => handleChange('bankName', t)} 
          />
          <PremiumInput 
            label="Account Number" type="numeric"
            placeholder="Account No" icon="hash" 
            value={formData.bankAccountNo} onChangeText={t => handleChange('bankAccountNo', t)} 
          />
          <PremiumInput 
            label="IFSC Code" type="ifsc"
            placeholder="11 Char IFSC" icon="code" 
            value={formData.bankIfsc} onChangeText={t => handleChange('bankIfsc', t)} 
            maxLength={11} hasError={errors.bankIfsc}
          />
        </View>

        {/* ERROR TOOLTIP */}
        {submitError ? (
          <View style={[styles.errorContainer, submitError.includes('Success') && styles.successContainer]}>
            <Text style={[styles.errorText, submitError.includes('Success') && styles.successText]}>
              {submitError}
            </Text>
          </View>
        ) : null}

        <View style={styles.footer}>
          <PremiumButton 
            title="Confirm Admission" onPress={handleAddStudent} 
            loading={loading} color={colors.primary} 
          />
        </View>

      </ScrollView>
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  scrollContent: { padding: 20, paddingBottom: 50 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, marginTop: 10 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: colors.text.secondary, marginRight: 10 },
  divider: { flex: 1, height: 1, backgroundColor: colors.border },
  card: { backgroundColor: colors.white, borderRadius: 16, padding: 20, marginBottom: 10, ...colors.shadow },
  footer: { marginTop: 10, marginBottom: 40 },
  errorContainer: { alignItems: 'center', marginBottom: 10, padding: 12, backgroundColor: '#fff5f5', borderRadius: 8, borderWidth: 1, borderColor: '#feb2b2' },
  errorText: { color: colors.error, fontWeight: 'bold', textAlign: 'center' },
  successContainer: { backgroundColor: '#f0fff4', borderColor: '#9ae6b4' },
  successText: { color: colors.success }
});

export default AddStudentScreen;