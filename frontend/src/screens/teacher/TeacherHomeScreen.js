import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import api from '../../services/api';
import colors from '../../constants/colors';
import { DashboardCard } from '../../components/PremiumComponents';

const TeacherHomeScreen = ({ navigation }) => {
  const [name, setName] = useState('Teacher');
  const [profilePic, setProfilePic] = useState(null);
  const [stats, setStats] = useState({
    totalStudents: 0,
    pendingPosts: 0,
  });
  const [loading, setLoading] = useState(true);

  // Reload data whenever the screen comes into focus (e.g., coming back from Settings)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });
    return unsubscribe;
  }, [navigation]);

  const loadData = async () => {
    try {
      // 1. INSTANT LOAD: Get cached data from device storage to save bandwidth & make UI instant
      const cachedName = await AsyncStorage.getItem('userName');
      const cachedPic = await AsyncStorage.getItem('userProfilePic');
      const cachedStats = await AsyncStorage.getItem('dashboardStats');
      
      if (cachedName) setName(cachedName);
      if (cachedPic) setProfilePic(cachedPic);
      if (cachedStats) setStats(JSON.parse(cachedStats));

      // 2. BACKGROUND FETCH: Get fresh data from the backend APIs
      const [studentsRes, postsRes, meRes] = await Promise.all([
        api.get('/teacher/students').catch(() => ({ data: [] })),
        api.get('/teacher/posts').catch(() => ({ data: [] })),
        api.get('/teacher/me').catch(() => ({ data: {} })),
      ]);

      // 3. CALCULATE FRESH STATS
      const freshStats = {
        totalStudents: studentsRes.data?.length || 0,
        pendingPosts: postsRes.data?.length || 0,
      };

      setStats(freshStats);

      // 4. UPDATE CACHE WITH FRESH DATA
      await AsyncStorage.setItem('dashboardStats', JSON.stringify(freshStats));
      
      if (meRes.data?.name) {
        setName(meRes.data.name);
        await AsyncStorage.setItem('userName', meRes.data.name);
      }
      
      if (meRes.data?.profilePhoto) {
        setProfilePic(meRes.data.profilePhoto);
        await AsyncStorage.setItem('userProfilePic', meRes.data.profilePhoto);
      }

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

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      
      {/* Header (Z-Index increased so it stays above scrolled content) */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.brand}>Pathshala+</Text>
          <Text style={styles.greeting}>{getGreeting()}, {name}!</Text>
        </View>
        <TouchableOpacity 
          style={styles.profileButtonContainer}
          onPress={() => navigation.navigate('Settings')} 
          activeOpacity={0.8}
        >
          {profilePic && profilePic !== "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" ? (
            <Image source={{ uri: profilePic }} style={styles.profileImage} />
          ) : (
            <View style={styles.profileButtonFallback}>
              <Feather name="user" size={24} color={colors.primary} />
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        
        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          {loading && stats.totalStudents === 0 ? (
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
          <DashboardCard 
            title="Add Student" 
            subtitle="Process new admission"
            icon="user-plus" 
            color={colors.cardBlue} 
            fullWidth={1}
            onPress={() => navigation.navigate('AddStudent')} 
          />
          <DashboardCard 
            title="Create Post" 
            subtitle="Notices & Homework"
            icon="edit-3" 
            color={colors.cardGreen} 
            fullWidth={1}
            onPress={() => navigation.navigate('PostNotice')} 
          />
          <DashboardCard 
            title="Check Homework" 
            subtitle="Submissions"
            icon="check-circle" 
            color={colors.cardIndigo}
            fullWidth={1}
            onPress={() => navigation.navigate('CheckHomework')}
          />
        </View>

      </ScrollView>

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
    zIndex: 10, 
    elevation: 10, 
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
  profileButtonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    // We add the shadow to the container for better Android support
    ...colors.shadow, 
  },
  profileImage: {
    width: 72, 
    height: 72, 
    borderRadius: 36,
    backgroundColor: '#f0f0f0',
    // Added White Border
    borderWidth: 2,
    borderColor: colors.white,
    // Added Shadow (Mainly works on iOS, container handles Android)
    ...colors.shadow,
  },
  profileButtonFallback: {
    width: 72, 
    height: 72, 
    backgroundColor: colors.background, 
    borderRadius: 36,
    justifyContent: 'center', 
    alignItems: 'center',
    // Added White Border
    borderWidth: 2,
    borderColor: colors.white,
    // Added Shadow
    ...colors.shadow,
  },

  // Content
  scrollContent: { 
    paddingHorizontal: 24, 
    paddingTop: 24,
    paddingBottom: 40,
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
});

export default TeacherHomeScreen;