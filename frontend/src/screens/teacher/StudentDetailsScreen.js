import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import api from '../../services/api';
import colors from '../../constants/colors';
import MainLayout from '../../components/MainLayout';

const StudentDetailsScreen = ({ route, navigation }) => {
  const { student } = route.params;
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    Alert.alert(
      "Delete Student",
      `Are you sure you want to delete ${student.name}? This action cannot be undone and all their data will be permanently removed.`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Yes, Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              setIsDeleting(true);
              await api.delete(`/teacher/delete-student/${student._id}`);
              
              Alert.alert("Success", "Student deleted successfully.", [
                { text: "OK", onPress: () => navigation.goBack() }
              ]);
            } catch (error) {
              const msg = error.response?.data?.message || "Failed to delete student.";
              Alert.alert("Error", msg);
              setIsDeleting(false);
            }
          }
        }
      ]
    );
  };

  const handleEdit = () => {
    navigation.navigate('EditStudent', { student });
  };

  const InfoRow = ({ icon, label, value }) => {
    const hasValue = value && value.toString().trim() !== '';
    const displayValue = hasValue ? value : "Not provided";
    const valueColor = hasValue ? colors.text.primary : colors.text.tertiary;
    const valueStyle = hasValue ? '500' : '400';

    return (
      <View style={styles.infoRow}>
        <View style={styles.infoIconBox}>
          <Feather name={icon} size={18} color={colors.primary} />
        </View>
        <View style={styles.infoContent}>
          <Text style={styles.infoLabel}>{label}</Text>
          <Text style={[styles.infoValue, { color: valueColor, fontWeight: valueStyle }]}>
            {displayValue}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <MainLayout title="Student Profile" navigation={navigation} showBack={true} showProfileIcon={false}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* 1. Profile Header */}
        <View style={styles.profileHeader}>
          {student.profilePhoto ? (
            <Image source={{ uri: student.profilePhoto }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{student.name.charAt(0).toUpperCase()}</Text>
            </View>
          )}
          <Text style={styles.name}>{student.name}</Text>
          <View style={styles.badgesContainer}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Class {student.class}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: colors.cardIndigo + '20' }]}>
              <Text style={[styles.badgeText, { color: colors.cardIndigo }]}>SR No: {student.srNo}</Text>
            </View>
          </View>
        </View>

        {/* 2. Contact Information */}
        <Text style={styles.sectionTitle}>Contact Information</Text>
        <View style={styles.card}>
          <InfoRow icon="phone" label="Mobile Number" value={student.mobile} />
          <InfoRow icon="map-pin" label="Residential Address" value={student.address} />
        </View>

        {/* 3. Personal Details */}
        <Text style={styles.sectionTitle}>Personal Details</Text>
        <View style={styles.card}>
          <InfoRow icon="calendar" label="Date of Birth" value={student.dob} />
          <InfoRow icon="hash" label="Aadhar Number" value={student.aadharNo} />
          <InfoRow icon="tag" label="Category" value={student.category} />
        </View>

        {/* 4. Family Details */}
        <Text style={styles.sectionTitle}>Family Details</Text>
        <View style={styles.card}>
          <InfoRow icon="user" label="Father's Name" value={student.fatherName} />
          <InfoRow icon="credit-card" label="Father's Aadhar" value={student.fatherAadharNo} />
          <View style={styles.divider} />
          <InfoRow icon="user" label="Mother's Name" value={student.motherName} />
          <InfoRow icon="credit-card" label="Mother's Aadhar" value={student.motherAadharNo} />
        </View>

        {/* 5. Documents & Financials */}
        <Text style={styles.sectionTitle}>Documents & Financials</Text>
        <View style={styles.card}>
          <InfoRow icon="file-text" label="Ration Card Type" value={student.rationCardType} />
          <InfoRow 
            icon="file" 
            label="Ration Card No." 
            value={student.rationCardType === 'None' ? 'N/A' : student.rationCardNo} 
          />
          <View style={styles.divider} />
          <InfoRow icon="home" label="Bank Name" value={student.bankName} />
          <InfoRow icon="hash" label="Bank Account No." value={student.bankAccountNo} />
          <InfoRow icon="code" label="Bank IFSC" value={student.bankIfsc} />
        </View>

        {/* 6. Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          {/* Edit Button - Centered, Shorter, No Box */}
          <TouchableOpacity 
            style={styles.editBtn} 
            onPress={handleEdit}
            activeOpacity={0.8}
          >
            <Feather name="edit-2" size={20} color={colors.white} />
            <Text style={styles.editBtnText}>Edit Details</Text>
          </TouchableOpacity>

          {/* Delete Button - Outline Danger */}
          <TouchableOpacity 
            style={styles.deleteBtn} 
            onPress={handleDelete}
            activeOpacity={0.8}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color={colors.error} />
            ) : (
              <>
                <Feather name="trash-2" size={20} color={colors.error} />
                <Text style={styles.deleteBtnText}>Delete</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

      </ScrollView>
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarImage: {
    width: 90, height: 90, borderRadius: 45,
    borderWidth: 3, borderColor: colors.white,
    ...colors.shadow, marginBottom: 12
  },
  avatarPlaceholder: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: '#e3f2fd', justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: colors.white,
    ...colors.shadow, marginBottom: 12
  },
  avatarText: { fontSize: 36, fontWeight: 'bold', color: colors.primary },
  name: { fontSize: 24, fontWeight: '800', color: colors.text.primary, marginBottom: 8, textAlign: 'center' },
  badgesContainer: { flexDirection: 'row', gap: 10 },
  badge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8
  },
  badgeText: { fontSize: 14, fontWeight: '700', color: colors.primary },

  sectionTitle: {
    fontSize: 16, fontWeight: '700', color: colors.text.primary,
    marginBottom: 10, marginLeft: 4, marginTop: 10
  },
  card: {
    backgroundColor: colors.white, borderRadius: 16, padding: 16,
    marginBottom: 20, ...colors.cardShadow, gap: 16
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider || '#f0f0f0',
    marginVertical: 4,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  infoIconBox: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: colors.primary + '10',
    justifyContent: 'center', alignItems: 'center', marginRight: 12
  },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 12, color: colors.text.secondary, fontWeight: '600', marginBottom: 2 },
  infoValue: { fontSize: 15, color: colors.text.primary },

  actionButtonsContainer: {
    gap: 12,
    marginTop: 10,
  },
  
  // Edit Button - Centered, Shorter Height, No Icon Box
  editBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14, // Reduced from 16
    gap: 8,
    ...colors.shadow,
  },
  editBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  
  // Delete Button - Outline style
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.error,
    backgroundColor: colors.white,
    gap: 8,
  },
  deleteBtnText: {
    color: colors.error,
    fontSize: 15,
    fontWeight: '700',
  }
});

export default StudentDetailsScreen;