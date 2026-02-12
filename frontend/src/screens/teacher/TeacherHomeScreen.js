import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons'; // Use Icons for Bottom Bar
import colors from '../../constants/colors';
import { DashboardCard } from '../../components/PremiumComponents';

const TeacherHomeScreen = ({ navigation }) => {
  const [name, setName] = useState('Teacher');

  useEffect(() => {
    const loadProfile = async () => {
      const storedName = await AsyncStorage.getItem('userName');
      if (storedName) setName(storedName);
    };
    loadProfile();
  }, []);

  // --- LOGIC: Confirm Logout ---
  const handleProfileClick = () => {
    Alert.alert(
      "Profile",
      "Do you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive", 
          onPress: async () => {
            await AsyncStorage.clear();
            navigation.replace('Welcome');
          } 
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      
      {/* 1. Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>Pathshala+</Text>
          <Text style={styles.welcome}>Good Morning, {name}</Text>
        </View>
        <TouchableOpacity onPress={handleProfileClick} style={styles.profileIcon}>
           <Feather name="user" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* 2. Grid Dashboard */}
        <View style={styles.gridContainer}>
          {/* Row 1 */}
          <View style={styles.row}>
            <DashboardCard 
              title="Add Admission" 
              icon="user-plus" 
              color={colors.primary} 
              onPress={() => navigation.navigate('AddStudent')} 
            />
            <View style={{ width: 15 }} /> 
            <DashboardCard 
              title="Create Post" 
              icon="edit" 
              color={colors.secondary} 
              onPress={() => navigation.navigate('PostNotice')} 
            />
          </View>

          {/* Row 2 */}
          <DashboardCard 
            title="Check Homework" 
            icon="check-circle" 
            color="#5C6BC0" // Indigo
            fullWidth={true}
            // Navigate to a new screen we will create next
            onPress={() => Alert.alert("Coming Up", "I am building the Homework List screen now.")}
          />

          {/* Row 3 */}
          <DashboardCard 
            title="Class List" 
            icon="users" 
            color="#78909C" // Blue Grey
            fullWidth={true}
            // Navigate to a new screen we will create next
            onPress={() => Alert.alert("Coming Up", "I am building the Class List screen now.")}
          />
        </View>

      </ScrollView>

      {/* 3. FUNCTIONAL Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => console.log("Home")}>
          <Feather name="home" size={24} color={colors.primary} />
          <Text style={[styles.navText, { color: colors.primary }]}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => Alert.alert("Search", "Search feature coming soon")}>
          <Feather name="search" size={24} color={colors.text.secondary} />
          <Text style={styles.navText}>Search</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => Alert.alert("Notifications", "No new notifications")}>
          <Feather name="bell" size={24} color={colors.text.secondary} />
          <Text style={styles.navText}>Alerts</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={handleProfileClick}>
          <Feather name="settings" size={24} color={colors.text.secondary} />
          <Text style={styles.navText}>Settings</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingTop: 10, marginBottom: 20,
  },
  brand: { fontSize: 22, fontWeight: '900', color: colors.text.primary },
  welcome: { fontSize: 14, color: colors.text.secondary },
  profileIcon: {
    width: 45, height: 45, backgroundColor: colors.white, borderRadius: 25,
    justifyContent: 'center', alignItems: 'center', ...colors.shadow,
  },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 100 },
  gridContainer: { marginTop: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  
  bottomNav: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 75,
    backgroundColor: colors.white, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    ...colors.shadow, shadowOffset: { width: 0, height: -10 }
  },
  navItem: { alignItems: 'center' },
  navText: { fontSize: 10, marginTop: 4, color: colors.text.secondary, fontWeight: '600' }
});

export default TeacherHomeScreen;