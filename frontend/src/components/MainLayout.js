import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import colors from '../constants/colors';

const MainLayout = ({ children, title, navigation, showBack = false }) => {
  return (
    <SafeAreaView style={styles.container}>
      
      {/* 1. TOP NAVBAR */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {showBack && (
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 15 }}>
              <Feather name="arrow-left" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>{title || "Pathshala+"}</Text>
        </View>
        
        {/* Profile / Settings Icon */}
        <TouchableOpacity onPress={() => console.log("Profile Clicked")}>
          <Feather name="user" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* 2. MIDDLE CONTENT (Scrollable) */}
      <View style={styles.content}>
        {children}
      </View>

      {/* 3. BOTTOM NAVIGATION (Fixed) */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('TeacherHome')}>
          <Feather name="home" size={24} color={colors.primary} />
          <Text style={[styles.navText, { color: colors.primary }]}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <Feather name="search" size={24} color={colors.text.secondary} />
          <Text style={styles.navText}>Search</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <Feather name="bell" size={24} color={colors.text.secondary} />
          <Text style={styles.navText}>Alerts</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
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
    padding: 20, backgroundColor: colors.white, 
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
    elevation: 2, shadowOpacity: 0.05
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text.primary },
  
  content: { flex: 1 }, // Takes remaining space

  bottomNav: {
    height: 70, backgroundColor: colors.white,
    flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
    borderTopWidth: 1, borderTopColor: '#f0f0f0'
  },
  navItem: { alignItems: 'center' },
  navText: { fontSize: 10, marginTop: 4, color: colors.text.secondary, fontWeight: '600' }
});

export default MainLayout;