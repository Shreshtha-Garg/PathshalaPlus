import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  ActivityIndicator, Alert, Image 
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../../services/api';
import colors from '../../../constants/colors';
import MainLayout from '../../../components/MainLayout';

const StudentProfileScreen = ({ navigation }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/student/me');
      setProfile(response.data);
    } catch (error) {
      console.log('Error fetching student profile:', error);
      
      const fallbackName = await AsyncStorage.getItem('userName');
      const fallbackMobile = await AsyncStorage.getItem('savedStudentMobile');
      const fallbackClass = await AsyncStorage.getItem('studentClass');
      
      setProfile({
        name: fallbackName || 'Student Name',
        mobile: fallbackMobile || 'N/A',
        class: fallbackClass || 'N/A',
        srNo: 'N/A',
        fatherName: 'N/A',
        address: 'N/A',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('userRole');
            await AsyncStorage.removeItem('studentClass');
            await AsyncStorage.removeItem('userMobile');
            navigation.replace('Welcome');
          }
        }
      ]
    );
  };

  const InfoRow = ({ icon, label, value }) => (
    <View style={styles.infoRow}>
      <View style={styles.infoIconBox}>
        <Feather name={icon} size={18} color={colors.cardIndigo} />
      </View>
      <View style={styles.infoTextContainer}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || 'Not provided'}</Text>
      </View>
    </View>
  );

  return (
    <MainLayout title="My Profile" navigation={navigation} showBack={false} showProfileIcon={false}>
      {loading ? (
        <ActivityIndicator size="large" color={colors.cardIndigo} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          
          {/* Header Card */}
          <View style={styles.headerCard}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {profile?.name ? profile.name.charAt(0).toUpperCase() : '?'}
              </Text>
            </View>
            
            <Text style={styles.studentName}>{profile?.name}</Text>
            
            <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Class {profile?.class}</Text>
              </View>
              {profile?.srNo && profile.srNo !== 'N/A' && (
                <View style={[styles.badge, { backgroundColor: colors.background }]}>
                  <Text style={[styles.badgeText, { color: colors.text.secondary }]}>SR: {profile.srNo}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Details Section */}
          <Text style={styles.sectionTitle}>Personal Details</Text>
          <View style={styles.detailsCard}>
            <InfoRow icon="phone" label="Mobile Number" value={profile?.mobile} />
            <View style={styles.divider} />
            <InfoRow icon="user" label="Father's Name" value={profile?.fatherName} />
            <View style={styles.divider} />
            <InfoRow icon="map-pin" label="Address" value={profile?.address} />
          </View>

          {/* Support Section - NEWLY ADDED */}
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.actionCard}>
            <TouchableOpacity 
              style={styles.actionRow} 
              onPress={() => navigation.navigate('AboutPathshala')}
            >
              <View style={styles.actionIconBox}>
                <Feather name="info" size={20} color={colors.cardIndigo} />
              </View>
              <Text style={styles.actionText}>About Pathshala+</Text>
              <Feather name="chevron-right" size={20} color={colors.text.tertiary} style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>
          </View>

          {/* Actions Section */}
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.actionCard}>
            <TouchableOpacity 
              style={styles.actionRow} 
              onPress={() => Alert.alert('Help', 'Please contact your teacher to update your profile.')}
            >
              <View style={[styles.actionIconBox, { backgroundColor: '#f5f5f5' }]}>
                <Feather name="edit-3" size={20} color={colors.text.secondary} />
              </View>
              <Text style={styles.actionText}>Request Profile Update</Text>
              <Feather name="chevron-right" size={20} color={colors.text.tertiary} style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity style={styles.actionRow} onPress={handleLogout}>
              <View style={[styles.actionIconBox, { backgroundColor: '#fff0f0' }]}>
                <Feather name="log-out" size={20} color={colors.error} />
              </View>
              <Text style={[styles.actionText, { color: colors.error }]}>Log Out</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.version}>Version 1.0.0</Text>

        </ScrollView>
      )}
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 50 },
  
  // Header Card
  headerCard: {
    backgroundColor: colors.white, borderRadius: 20, padding: 24,
    alignItems: 'center', marginBottom: 24, ...colors.shadow,
  },
  avatarPlaceholder: {
    width: 90, height: 90, borderRadius: 45, backgroundColor: colors.cardIndigo + '15',
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  avatarText: { fontSize: 36, fontWeight: '800', color: colors.cardIndigo },
  studentName: { fontSize: 22, fontWeight: '800', color: colors.text.primary, marginBottom: 10, textAlign: 'center' },
  badgeRow: { flexDirection: 'row', gap: 8 },
  badge: { backgroundColor: colors.cardIndigo + '15', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  badgeText: { color: colors.cardIndigo, fontSize: 13, fontWeight: '700' },

  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: colors.text.secondary, marginBottom: 10, marginLeft: 5, marginTop: 5 },
  
  // Details Card
  detailsCard: { backgroundColor: colors.white, borderRadius: 16, padding: 20, marginBottom: 24, ...colors.shadow },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  infoIconBox: { width: 40, height: 40, borderRadius: 10, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  infoTextContainer: { flex: 1 },
  infoLabel: { fontSize: 12, color: colors.text.secondary, fontWeight: '500', marginBottom: 2 },
  infoValue: { fontSize: 15, fontWeight: '600', color: colors.text.primary },
  divider: { height: 1, backgroundColor: colors.divider, marginVertical: 8 },

  // Actions Card
  actionCard: { backgroundColor: colors.white, borderRadius: 16, paddingVertical: 5, paddingHorizontal: 15, marginBottom: 24, ...colors.shadow },
  actionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  actionIconBox: { width: 32, height: 32, borderRadius: 8, backgroundColor: colors.cardIndigo + '15', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  actionText: { fontSize: 15, fontWeight: '600', color: colors.text.primary },
  version: { textAlign: 'center', color: colors.text.secondary, marginTop: 10, fontSize: 12 }
});

export default StudentProfileScreen;