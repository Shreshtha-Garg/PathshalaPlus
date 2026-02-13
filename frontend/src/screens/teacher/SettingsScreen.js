import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Image, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import api from '../../services/api';
import colors from '../../constants/colors';
import MainLayout from '../../components/MainLayout';

const SettingsScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/teacher/me');
      setUser(response.data);
    } catch (error) {
      console.log("Error fetching profile, falling back to local storage");
      const name = await AsyncStorage.getItem('userName');
      const role = await AsyncStorage.getItem('userRole');
      setUser({ 
        name: name || "Teacher", 
        role: role || "Teacher", 
        profilePhoto: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" 
      });
    } finally {
      setLoading(false);
    }
  };

  const MenuItem = ({ icon, label, onPress, isDestructive = false }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuLeft}>
        <View style={[styles.iconBox, isDestructive && styles.destructiveIconBox]}>
          <Feather name={icon} size={20} color={isDestructive ? colors.error : colors.primary} />
        </View>
        <Text style={[styles.menuText, isDestructive && styles.destructiveText]}>{label}</Text>
      </View>
      <Feather name="chevron-right" size={20} color={colors.text.secondary} />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <MainLayout title="Settings" navigation={navigation} showBack={false}>
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* 1. Profile Card */}
        <View style={styles.profileCard}>
          <Image 
            source={{ uri: user?.profilePhoto || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" }} 
            style={styles.avatar} 
          />
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{user?.name}</Text>
            <Text style={styles.role}>{user?.role}</Text>
            <Text style={styles.email}>{user?.email}</Text>
          </View>
        </View>

        {/* 2. Edit Profile Button (NEW - LINKED) */}
        <TouchableOpacity 
          style={styles.editButton} 
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Feather name="edit-2" size={16} color={colors.white} style={{ marginRight: 8 }} />
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>

        {/* 3. Account Section (LINKED) */}
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.section}>
          <MenuItem 
            icon="user" 
            label="View Full Profile" 
            onPress={() => navigation.navigate('ViewProfile')} 
          />
        </View>

        {/* 4. Admin Section (LINKED) */}
        {user?.role === 'Admin' && (
          <>
            <Text style={styles.sectionTitle}>Administration</Text>
            <View style={styles.section}>
              <MenuItem 
                icon="user-plus" 
                label="Add New Teacher" 
                onPress={() => navigation.navigate('AddTeacher')} 
              />
              <MenuItem 
                icon="trash-2" 
                label="Remove Teacher" 
                onPress={() => navigation.navigate('RemoveTeacher')} 
              />
            </View>
          </>
        )}

        {/* 5. Support Section (LINKED) */}
        <Text style={styles.sectionTitle}>Support</Text>
        <View style={styles.section}>
          <MenuItem 
            icon="info" 
            label="About Pathshala+" 
            onPress={() => navigation.navigate('AboutPathshala')} 
          />
        </View>

        <View style={styles.logoutContainer}>
          <MenuItem 
            icon="log-out" 
            label="Log Out" 
            onPress={() => {
                Alert.alert("Logout", "Confirm logout?", [
                    { text: "Cancel", style: "cancel" },
                    { 
                      text: "Logout", 
                      style: "destructive", 
                      onPress: async () => { 
                        await AsyncStorage.clear(); 
                        navigation.replace('Welcome'); 
                      } 
                    }
                ])
            }} 
            isDestructive={true} 
          />
        </View>
        
        <Text style={styles.version}>Version 1.0.0</Text>

      </ScrollView>
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 50 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  profileCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white,
    padding: 20, borderRadius: 16, marginBottom: 15, ...colors.shadow
  },
  avatar: { width: 60, height: 60, borderRadius: 30, marginRight: 15, backgroundColor: '#f0f0f0' },
  profileInfo: { flex: 1 },
  name: { fontSize: 18, fontWeight: 'bold', color: colors.text.primary },
  role: { fontSize: 14, fontWeight: '600', color: colors.primary, marginTop: 2 },
  email: { fontSize: 12, color: colors.text.secondary, marginTop: 2 },
  
  // New Edit Button Style
  editButton: { 
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', 
    backgroundColor: colors.primary, padding: 12, borderRadius: 12, marginBottom: 25, ...colors.shadow 
  },
  editButtonText: { color: colors.white, fontWeight: 'bold', fontSize: 14 },

  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: colors.text.secondary, marginBottom: 10, marginLeft: 5, marginTop: 5 },
  section: { backgroundColor: colors.white, borderRadius: 16, paddingVertical: 5, paddingHorizontal: 15, marginBottom: 10, ...colors.shadow },
  
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#f0f9ff', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  destructiveIconBox: { backgroundColor: '#fff0f0' },
  menuText: { fontSize: 16, color: colors.text.primary },
  destructiveText: { color: colors.error, fontWeight: 'bold' },
  
  logoutContainer: { marginTop: 20, backgroundColor: colors.white, borderRadius: 16, paddingHorizontal: 15, ...colors.shadow },
  version: { textAlign: 'center', color: colors.text.secondary, marginTop: 20, fontSize: 12 }
});

export default SettingsScreen;