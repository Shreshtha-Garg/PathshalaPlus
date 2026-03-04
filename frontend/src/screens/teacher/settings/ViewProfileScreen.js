import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../../services/api';
import colors from '../../../constants/colors';
import MainLayout from '../../../components/MainLayout';

const ViewProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      // 1. Try to grab everything from AsyncStorage FIRST
      const name = await AsyncStorage.getItem('userName');
      const role = await AsyncStorage.getItem('userRole');
      const mobile = await AsyncStorage.getItem('userMobile'); // Assuming we start saving this
      const cachedPhoto = await AsyncStorage.getItem('profilePhoto');

      // 2. If we have the essential data, set it and EXIT early (No API call!)
      if (name && role) {
        setUser({
          name: name,
          role: role,
          mobile: mobile || "Not Provided",
          profilePhoto: cachedPhoto || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
        });
        setLoading(false);
        return; 
      }

      // 3. ONLY if AsyncStorage is empty, fetch from the backend
      const response = await api.get('/teacher/me');
      const userData = response.data;
      setUser(userData);
      
      // 4. Cache the newly fetched data so we don't have to fetch it next time
      if (userData.name) await AsyncStorage.setItem('userName', userData.name);
      if (userData.role) await AsyncStorage.setItem('userRole', userData.role);
      if (userData.mobile) await AsyncStorage.setItem('userMobile', userData.mobile);
      if (userData.profilePhoto) await AsyncStorage.setItem('profilePhoto', userData.profilePhoto);

    } catch (error) {
      console.log('Error fetching profile:', error);
      // Absolute fallback if everything fails
      setUser({
        name: "Teacher",
        role: "Teacher",
        profilePhoto: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
      });
    } finally {
      setLoading(false);
    }
  };

  const ReadOnlyField = ({ label, value, icon }) => (
    <View style={styles.fieldContainer}>
      <View style={styles.iconBox}>
        <Feather name={icon} size={20} color={colors.primary} />
      </View>
      <View style={styles.textGroup}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value || "Not Provided"}</Text>
      </View>
    </View>
  );

  if (loading) return <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />;

  return (
    <MainLayout title="My Profile" navigation={navigation} showBack={true}>
      <View style={styles.container}>
        
        {/* Header Section */}
        <View style={styles.header}>
          <Image 
            source={{ uri: user?.profilePhoto || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" }} 
            style={styles.avatar} 
          />
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.role}>{user?.role}</Text>
        </View>

        {/* Details Card */}
        <View style={styles.card}>
            <ReadOnlyField label="Full Name" value={user?.name} icon="user" />
            <View style={styles.divider} />
            <ReadOnlyField label="Mobile Number" value={user?.mobile} icon="smartphone" />
            <View style={styles.divider} />
            <ReadOnlyField label="Account Role" value={user?.role} icon="shield" />
        </View>

      </View>
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  header: { alignItems: 'center', marginBottom: 30 },
  avatar: { 
    width: 200, 
    height: 200, 
    borderRadius: 100, 
    marginBottom: 15, 
    backgroundColor: '#f0f0f0',
    borderWidth: 3,
    borderColor: colors.white,
    ...colors.shadow 
  },
  name: { fontSize: 24, fontWeight: 'bold', color: colors.text.primary },
  role: { fontSize: 16, color: colors.primary, fontWeight: '600', marginTop: 5 },
  
  card: { backgroundColor: colors.white, borderRadius: 16, padding: 20, ...colors.shadow },
  
  fieldContainer: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  iconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#f0f9ff', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  textGroup: { flex: 1 },
  label: { fontSize: 12, color: colors.text.secondary, marginBottom: 2 },
  value: { fontSize: 16, color: colors.text.primary, fontWeight: '500' },
  
  divider: { height: 1, backgroundColor: '#f0f0f0', marginLeft: 55 }
});

export default ViewProfileScreen;