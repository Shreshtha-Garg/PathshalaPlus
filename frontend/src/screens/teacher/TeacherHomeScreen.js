import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

  const handleLogout = async () => {
    await AsyncStorage.clear();
    navigation.replace('Welcome');
  };

  return (
    <SafeAreaView style={styles.container}>
      
      {/* 1. Top Bar */}
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>Pathshala+</Text>
          <Text style={styles.welcome}>Welcome, {name}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.profileIcon}>
           {/* Placeholder for Profile Pic */}
          <Text style={{ fontSize: 20 }}>👤</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* 2. Grid Layout (Matches Image 3) */}
        <View style={styles.gridContainer}>
          {/* Row 1 */}
          <View style={styles.row}>
            <DashboardCard 
              title="Add Students" 
              icon="user-plus" 
              color={colors.primary} 
              onPress={() => navigation.navigate('AddStudent')} // <--- LINKED
            />
            <View style={{ width: 15 }} /> 
            <DashboardCard 
              title="Post Notices" 
              icon="mic" 
              color={colors.secondary} 
              onPress={() => navigation.navigate('PostNotice')} // <--- LINKED
            />
          </View>

          {/* Row 2 (Full Width) */}
          <DashboardCard 
            title="Check Homework" 
            icon="book" 
            color="#2D8CFF" // Slightly different blue
            fullWidth={true}
            onPress={() => Alert.alert("Feature", "Homework Screen coming next!")}
          />

          {/* Row 3 (Extra Tools) */}
          <DashboardCard 
            title="Class List" 
            icon="users" 
            color="#A0A0A0" // Grey for secondary tools
            fullWidth={true}
            onPress={() => console.log("Class List")}
          />
        </View>

      </ScrollView>

      {/* 3. Bottom Navigation Bar (Visual Only) */}
      <View style={styles.bottomNav}>
        <Text style={{ fontSize: 24, opacity: 1 }}>🏠</Text>
        <Text style={{ fontSize: 24, opacity: 0.3 }}>👥</Text>
        <Text style={{ fontSize: 24, opacity: 0.3 }}>🔔</Text>
        <Text style={{ fontSize: 24, opacity: 0.3 }}>⚙️</Text>
      </View>

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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 10,
    marginBottom: 20,
  },
  brand: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.text.primary,
  },
  welcome: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  profileIcon: {
    width: 40,
    height: 40,
    backgroundColor: colors.white,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    ...colors.shadow,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  gridContainer: {
    marginTop: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 0, 
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: colors.white,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    ...colors.shadow,
    shadowOffset: { width: 0, height: -5 }, // Shadow upwards
  }
});

export default TeacherHomeScreen;