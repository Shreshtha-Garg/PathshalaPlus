import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import api from '../../services/api';
import colors from '../../constants/colors';
import { DashboardCard } from '../../components/PremiumComponents';

const TeacherHomeScreen = ({ navigation }) => {
  const [name, setName] = useState('Teacher');
  const [stats, setStats] = useState({
    totalStudents: 0,
    pendingPosts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load profile
      const storedName = await AsyncStorage.getItem('userName');
      if (storedName) setName(storedName);

      // Fetch stats from backend
      const [studentsRes, postsRes] = await Promise.all([
        api.get('/teacher/students').catch(() => ({ data: [] })),
        api.get('/teacher/posts').catch(() => ({ data: [] })),
      ]);

      setStats({
        totalStudents: studentsRes.data?.length || 0,
        pendingPosts: postsRes.data?.filter(p => p.type === 'Homework')?.length || 0,
      });

    } catch (error) {
      console.log('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Logout confirmation
  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
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
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.brand}>Pathshala+</Text>
          <Text style={styles.greeting}>{getGreeting()}, {name}!</Text>
        </View>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={handleLogout}
        >
          <Feather name="user" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        
        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : (
            <>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{stats.totalStudents}</Text>
                <Text style={styles.statLabel}>Total Students</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{stats.pendingPosts}</Text>
                <Text style={styles.statLabel}>Active Posts</Text>
              </View>
            </>
          )}
        </View>

        {/* Quick Actions Grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>

        <View style={styles.grid}>
          
          {/* Row 1 - Two Cards */}
          <DashboardCard 
            title="Add Student" 
            subtitle="New admission"
            icon="user-plus" 
            color={colors.cardBlue} 
            fullWidth={true}
            onPress={() => navigation.navigate('AddStudent')} 
          />
          
          <DashboardCard 
            title="Create Post" 
            subtitle="Homework & notices"
            icon="edit-3" 
            color={colors.cardGreen} 
            fullWidth={true}
            onPress={() => navigation.navigate('PostNotice')} 
          />

          {/* Row 2 - Full Width */}
          <DashboardCard 
            title="Check Homework" 
            subtitle="Review submissions"
            icon="check-circle" 
            color={colors.cardIndigo}
            fullWidth={true}
            onPress={() => navigation.navigate('CheckHomework')}
          />

          {/* Row 3 - Full Width */}
          <DashboardCard 
            title="Class List" 
            subtitle="View all students"
            icon="users" 
            color={colors.cardSlate}
            fullWidth={true}
            onPress={() => navigation.navigate('ClassList')}
          />

        </View>

      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Feather name="home" size={24} color={colors.primary} />
          <Text style={[styles.navText, { color: colors.primary }]}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => Alert.alert("Search", "Search feature coming soon")}
        >
          <Feather name="search" size={24} color={colors.text.secondary} />
          <Text style={styles.navText}>Search</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => Alert.alert("Notifications", "No new notifications")}
        >
          <View style={styles.badgeContainer}>
            <Feather name="bell" size={24} color={colors.text.secondary} />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </View>
          <Text style={styles.navText}>Alerts</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Settings')}
        >
          <Feather name="settings" size={24} color={colors.text.secondary} />
          <Text style={styles.navText}>Settings</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.background 
  },
  
  // Header
  header: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingHorizontal: 24, 
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: colors.white,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...colors.cardShadow,
  },
  headerLeft: {
    flex: 1,
  },
  brand: { 
    fontSize: 24, 
    fontWeight: '900', 
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  greeting: { 
    fontSize: 15, 
    color: colors.text.secondary,
    marginTop: 4,
    fontWeight: '500',
  },
  profileButton: {
    width: 48, 
    height: 48, 
    backgroundColor: colors.background, 
    borderRadius: 24,
    justifyContent: 'center', 
    alignItems: 'center',
  },

  // Content
  scrollContent: { 
    paddingHorizontal: 24, 
    paddingTop: 24,
    paddingBottom: 100,
  },

  // Stats Cards
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 30,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    ...colors.cardShadow,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: colors.text.secondary,
    fontWeight: '600',
  },

  // Section
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },

  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  
  // Bottom Navigation
  bottomNav: {
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    height: 80,
    backgroundColor: colors.white, 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    alignItems: 'center',
    borderTopLeftRadius: 24, 
    borderTopRightRadius: 24,
    paddingBottom: 10,
    ...colors.shadow,
  },
  navItem: { 
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  navText: { 
    fontSize: 11, 
    marginTop: 6, 
    color: colors.text.secondary, 
    fontWeight: '600' 
  },
  badgeContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
});

export default TeacherHomeScreen;